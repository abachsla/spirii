import { InjectRepository } from '@nestjs/typeorm';
import { NextDataWindowLoadQueryEntity } from '../model/next-data-window-load-query.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TxApiClient } from '../api/tx-api.client';
import { TransactionDtoType } from '../api/transaction.type';
import { AggregatedDataService } from '../../core/service/aggregated-data.service';
import { AggregatedTxData } from '../../core/entity/aggregated-data.entity';
import { TxApiClientService } from './tx-api-client.service';

type AggregatedUserChange = {
  earned: number;
  spent: number;
  payout: number;
  paidout: number;
};

@Injectable()
export class EtlService {
  public static readonly HISTORY_PRELOAD_PERIOD = 1000 * 60 * 2; // 2 min

  constructor(
    @InjectRepository(NextDataWindowLoadQueryEntity)
    private readonly nxtDataWindowLoadQueryRepository: Repository<NextDataWindowLoadQueryEntity>,
    private readonly txApiClient: TxApiClientService,
    private readonly aggregatedDataService: AggregatedDataService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * TODO refactor code to get rid from following problems:
   */
  public async loadNextTxWindow() {
    let endDate = new Date(Math.floor(new Date().getTime() / 1000) * 1000);
    let startDate = new Date(endDate.getMilliseconds() - EtlService.HISTORY_PRELOAD_PERIOD);
    let pageNumber: number | null = null;

    const nextQueryParamsEntity = await this.nxtDataWindowLoadQueryRepository.findOneOrFail({});

    if (nextQueryParamsEntity) {
      startDate = nextQueryParamsEntity.startDate;
      endDate = nextQueryParamsEntity.endDate;
      pageNumber = nextQueryParamsEntity.pageNumber;
    }

    // FIXME maximal page size must be configurable
    const txWindow = await this.txApiClient.loadTxWindow(startDate, endDate, pageNumber, 1000);
    const aggregatedChangeByUser = new Map<string, AggregatedUserChange>();
    (txWindow.items || []).forEach(tx => {
      let userInfo = aggregatedChangeByUser.get(tx.userId);
      if (!userInfo) {
        userInfo = { earned: 0, spent: 0, payout: 0, paidout: 0 };
        aggregatedChangeByUser.set(tx.userId, userInfo);
      }

      switch (tx.type) {
        case TransactionDtoType.EARNED:
          userInfo.earned += tx.amount;
          break;
        case TransactionDtoType.SPENT:
          userInfo.spent += tx.amount;
          break;
        case TransactionDtoType.PAYOUT:
          userInfo.payout += tx.amount;
          break;
        case TransactionDtoType.PAIDOUT:
          userInfo.paidout += tx.amount;
          break;
      }
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalNxtDataWindowLoadQueryRepository =
        queryRunner.manager.getRepository(NextDataWindowLoadQueryEntity);
      // Put under single transaction
      for (const [userId, agg] of aggregatedChangeByUser) {
        let aggEntity = await this.aggregatedDataService.getAggregatedDataByUserId(userId);
        if (!aggEntity) {
          aggEntity = new AggregatedTxData();
          aggEntity.userId = userId;
        }

        aggEntity.balance = aggEntity.balance + agg.earned - agg.spent - agg.payout;
        aggEntity.earned += agg.earned;
        aggEntity.spent += agg.spent;
        aggEntity.payout += agg.payout;
        aggEntity.paidout += agg.paidout;

        await this.aggregatedDataService.save(aggEntity);
      }

      // Calculate next window query parameters
      const newNextWindowQueryParamsEntity = new NextDataWindowLoadQueryEntity();
      // If all pages are loaded for current period then switch to next one
      if (txWindow.meta.currentPage === txWindow.meta.totalPages) {
        newNextWindowQueryParamsEntity.startDate = startDate;
        newNextWindowQueryParamsEntity.endDate = endDate;
        newNextWindowQueryParamsEntity.pageNumber = pageNumber ? pageNumber + 1 : null;
      } else if (nextQueryParamsEntity) {
        newNextWindowQueryParamsEntity.startDate = new Date(nextQueryParamsEntity.endDate.getMilliseconds() + 1);
        newNextWindowQueryParamsEntity.endDate = new Date(
          nextQueryParamsEntity.endDate.getMilliseconds() + EtlService.HISTORY_PRELOAD_PERIOD,
        );
      }

      await transactionalNxtDataWindowLoadQueryRepository.save(newNextWindowQueryParamsEntity);

      await queryRunner.commitTransaction();
      console.log('Aggregated data window is stored in DB');
    } catch (e) {
      console.error('Can not save aggregated data to database', e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
