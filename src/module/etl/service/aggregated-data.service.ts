import { Injectable } from '@nestjs/common';
import { AggregatedUserTxDataEntity } from '../model/aggregated-user-tx-data.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransactionEntity, TransactionType } from '../model/fact-transaction.entity';
import { Transactional } from 'typeorm-transactional';
import Decimal from 'decimal.js';

@Injectable()
export class AggregatedDataService {
  constructor(
    @InjectRepository(AggregatedUserTxDataEntity)
    private aggregatedDataRepository: Repository<AggregatedUserTxDataEntity>,
    @InjectRepository(FactTransactionEntity)
    private factTransactionEntityRepository: Repository<FactTransactionEntity>,
  ) {}

  @Transactional()
  async getAggregatedDataByUserId(userId: string): Promise<AggregatedUserTxDataEntity | null> {
    return this.aggregatedDataRepository.findOne({ where: { userId } });
  }

  @Transactional()
  async getRequestedPayouts(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ userId: string; amount: number }> {
    const queryBuilder = this.factTransactionEntityRepository
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'amount')
      .where('t.userId = :userId', { userId })
      .andWhere('t.startDate >= :startDate', { startDate })
      .andWhere('t.endDate <= :endDate', { endDate })
      .andWhere('t.type = :transactionType', { transactionType: TransactionType.PAY_OUT });

    const result = await queryBuilder.getRawOne<{ amount: string }>();

    const totalAmount = result && result.amount !== null ? new Decimal(result.amount).toNumber() : 0;

    return { userId: userId, amount: totalAmount };
  }

  @Transactional()
  async save(data: AggregatedUserTxDataEntity): Promise<AggregatedUserTxDataEntity> {
    return this.aggregatedDataRepository.save(data);
  }

  @Transactional()
  async createOrUpdateFact(
    userId: string,
    amount: Decimal,
    type: TransactionType,
    startDate: Date,
    endDate: Date,
  ): Promise<FactTransactionEntity> {
    // instead of saving new record we should check for existing one and update it
    // because existing record could be created for same user and same period by data from other page
    let fact = await this.factTransactionEntityRepository.findOne({ where: { userId, type, startDate, endDate } });

    if (!fact) {
      fact = new FactTransactionEntity();
      fact.amount = amount?.toNumber() || 0;
    } else {
      fact.amount = (fact.amount || 0) + (amount?.toNumber() || 0);
    }

    fact.userId = userId;
    fact.type = type;
    fact.startDate = startDate;
    fact.endDate = endDate;

    return this.factTransactionEntityRepository.save(fact);
  }
}
