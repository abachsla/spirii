import { InjectRepository } from '@nestjs/typeorm';
import { NextDataWindowLoadQueryEntity } from '../model/next-data-window-load-query.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { AggregatedDataService } from './aggregated-data.service';
import { AggregatedUserTxDataEntity } from '../model/aggregated-user-tx-data.entity';
import { TxApiClientService } from '../api/tx-api-client.service';
import Decimal from 'decimal.js';
import { TransactionDtoResponse, TransactionDtoType } from '../api/transaction.type';
import { FactTransactionEntity, TransactionType } from '../model/fact-transaction.entity';

type AggregatedUserChange = {
  earned: Decimal;
  spent: Decimal;
  payout: Decimal;
  paidout: Decimal;
};

@Injectable()
export class EtlService {
  // ~1 min or 59 seconds as start boundary included and start of next windows excluded
  public static readonly HISTORY_PRELOAD_PERIOD = 1000 * 60 - 1;

  private readonly logger = new Logger(EtlService.name);

  constructor(
    @InjectRepository(NextDataWindowLoadQueryEntity)
    private readonly nxtDataWindowLoadQueryRepository: Repository<NextDataWindowLoadQueryEntity>,
    private readonly txApiClient: TxApiClientService,
    private readonly aggregatedDataService: AggregatedDataService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * TODO refactor code to get rid from following problems:
   * 1 concurrent execution when previous task was not completed but new one is triggered ... add locking
   * 2 page size max value must be configured
   */
  public async loadNextTxWindow() {
    this.logger.log('Starting to load TX data window');

    // Set default values for case when application just initialized and there is no any data in DB
    // Truncate current time to the end of previous minute
    let { startDate, endDate, pageNumber } = this.calculateInitialQueryParams(new Date());

    // Expecting only single record in DB
    const nextQueryParamsEntity = await this.nxtDataWindowLoadQueryRepository
      .find({ order: { id: 'DESC' } })
      .then(r => (r ? r[0] : null));

    if (nextQueryParamsEntity) {
      startDate = nextQueryParamsEntity.startDate;
      endDate = nextQueryParamsEntity.endDate;
      pageNumber = nextQueryParamsEntity.pageNumber;
    }

    // If end date in the future then nothing to do and we should wait when current window close
    if (endDate.getTime() > new Date().getTime()) {
      this.logger.log(
        `All data is up to date and next period window (from ${startDate.toString()} to ${endDate.toString()}) is still open`,
      );
      return;
    }

    this.logger.log(`Requesting TX data window from ${startDate.toString()} to ${endDate.toString()}`);

    const txWindow = await this.txApiClient.loadTxWindow(startDate, endDate, pageNumber, 1000);
    const aggregatedChangeByUser = this.calculateChanges(txWindow);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const [userId, agg] of aggregatedChangeByUser) {
        await this.applyUserChange(userId, agg);
        await this.saveAggFact(userId, agg, startDate, endDate);
      }

      this.logger.log(
        `Loaded page ${txWindow.meta.currentPage} of ${txWindow.meta.totalPages} for [${startDate.toString()} / ${endDate.toString()}]`,
      );

      // Calculate next window query parameters
      const newNextWindowQueryParamsEntity = nextQueryParamsEntity || new NextDataWindowLoadQueryEntity();
      // If all pages are loaded for current period then switch to next one
      if (txWindow.meta.currentPage >= txWindow.meta.totalPages) {
        newNextWindowQueryParamsEntity.startDate = new Date(endDate.getTime() + 1);
        newNextWindowQueryParamsEntity.endDate = new Date(
          newNextWindowQueryParamsEntity.startDate.getTime() + EtlService.HISTORY_PRELOAD_PERIOD,
        );
        newNextWindowQueryParamsEntity.pageNumber = null;
      } else {
        newNextWindowQueryParamsEntity.startDate = startDate;
        newNextWindowQueryParamsEntity.endDate = endDate;
        newNextWindowQueryParamsEntity.pageNumber = txWindow.meta.currentPage + 1;
      }

      const nextDataWindowLoadQueryRepository = queryRunner.manager.getRepository(NextDataWindowLoadQueryEntity);
      await nextDataWindowLoadQueryRepository.save(newNextWindowQueryParamsEntity);

      await queryRunner.commitTransaction();
      console.log('Aggregated data window is stored in DB');
    } catch (e) {
      console.error('Can not save aggregated data to database', e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  protected calculateChanges(txWindow: TransactionDtoResponse): Map<string, AggregatedUserChange> {
    const aggregatedChangeByUser = new Map<string, AggregatedUserChange>();

    (txWindow.items || []).forEach(tx => {
      let userInfo = aggregatedChangeByUser.get(tx.userId);
      const amount = new Decimal(tx.amount);
      if (!userInfo) {
        userInfo = {
          earned: new Decimal(0),
          spent: new Decimal(0),
          payout: new Decimal(0),
          paidout: new Decimal(0),
        };
        aggregatedChangeByUser.set(tx.userId, userInfo);
      }

      switch (tx.type) {
        case TransactionDtoType.EARNED:
          userInfo.earned = userInfo.earned.add(amount);
          break;
        case TransactionDtoType.SPENT:
          userInfo.spent = userInfo.spent.add(amount);
          break;
        case TransactionDtoType.PAYOUT:
          userInfo.payout = userInfo.payout.add(amount);
          break;
        case TransactionDtoType.PAIDOUT:
          userInfo.paidout = userInfo.paidout.add(amount);
          break;
      }
    });

    return aggregatedChangeByUser;
  }

  protected calculateInitialQueryParams(t: Date): { startDate: Date; endDate: Date; pageNumber: number | null } {
    const endDate = new Date(Math.floor(t.getTime() / 60000) * 60000 - 1);
    const startDate = new Date(endDate.getTime() - EtlService.HISTORY_PRELOAD_PERIOD);
    const pageNumber: number | null = null;

    return { startDate, endDate, pageNumber };
  }

  protected async applyUserChange(userId: string, agg: AggregatedUserChange): Promise<AggregatedUserTxDataEntity> {
    let aggEntity = await this.aggregatedDataService.getAggregatedDataByUserId(userId);

    let balance = new Decimal(aggEntity?.balance || 0);
    balance = balance.add(agg.earned).sub(agg.spent).sub(agg.payout);

    let earned = new Decimal(aggEntity?.earned || 0);
    earned = earned.add(agg.earned);

    let spent = new Decimal(aggEntity?.spent || 0);
    spent = spent.add(agg.spent);

    let payout = new Decimal(aggEntity?.payout || 0);
    payout = payout.add(agg.payout);

    let paidout = new Decimal(aggEntity?.paidout || 0);
    paidout = paidout.add(agg.paidout);

    if (!aggEntity) {
      aggEntity = new AggregatedUserTxDataEntity();
      aggEntity.userId = userId;
    }

    aggEntity.balance = balance.toNumber();
    aggEntity.earned = earned.toNumber();
    aggEntity.spent = spent.toNumber();
    aggEntity.payout = payout.toNumber();
    aggEntity.paidout = paidout.toNumber();

    return this.aggregatedDataService.save(aggEntity);
  }

  protected async saveAggFact(
    userId: string,
    agg: AggregatedUserChange,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    await this.aggregatedDataService.createFact(userId, agg.earned, TransactionType.EARNED, startDate, endDate);
    await this.aggregatedDataService.createFact(userId, agg.spent, TransactionType.SPENT, startDate, endDate);
    await this.aggregatedDataService.createFact(userId, agg.payout, TransactionType.PAY_OUT, startDate, endDate);
    // FIXME I rely on assumption that Transaction API will return PAID_OUTs as a separate transaction, otherwise
    // code must be refactored and I must do currency conversion here from payout against configured/dynamic exchange rate
    await this.aggregatedDataService.createFact(userId, agg.paidout, TransactionType.PAID_OUT, startDate, endDate);
  }
}
