import { Module } from '@nestjs/common';
import { AggregationController } from './controller/aggregation.controller';
import { EtlModule } from '../etl/etl.module';

@Module({
  imports: [EtlModule.forRoot()],
  controllers: [AggregationController],
  providers: [],
  exports: [],
})
export class FrontModule {}
