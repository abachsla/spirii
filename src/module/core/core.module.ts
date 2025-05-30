import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregationController } from './controller/aggregation.controller';
import { AggregatedDataService } from './service/aggregated-data.service';
import { Transaction } from './entity/transaction.entity';
import { AggregatedTxData } from './entity/aggregated-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, AggregatedTxData])],
  controllers: [AggregationController],
  providers: [AggregatedDataService],
  exports: [AggregatedDataService],
})
export class CoreModule {}
