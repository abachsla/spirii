import { Injectable } from '@nestjs/common';
import { AggregatedTxData } from '../entity/aggregated-data.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entity/transaction.entity';

@Injectable()
export class AggregatedDataService {
  constructor(
    @InjectRepository(AggregatedTxData)
    private aggregatedDataRepository: Repository<AggregatedTxData>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getAggregatedDataByUserId(userId: string): Promise<AggregatedTxData | null> {
    return this.aggregatedDataRepository.findOne({ where: { userId } });
  }

  async getRequestedPayouts(): Promise<AggregatedTxData[]> {
    return this.aggregatedDataRepository.find({
      where: { payout: MoreThanOrEqual(0.01) },
    });
  }

  async save(data: AggregatedTxData): Promise<AggregatedTxData> {
    return this.aggregatedDataRepository.save(data);
  }
}
