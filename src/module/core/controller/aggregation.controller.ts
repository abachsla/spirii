import { Controller, Get, Param } from '@nestjs/common';
import { AggregatedDataService } from '../service/aggregated-data.service';
import { AggregatedTxData } from '../entity/aggregated-data.entity';

@Controller('aggregated-data')
export class AggregationController {
  constructor(private readonly aggregatedDataService: AggregatedDataService) {}

  @Get(':userId')
  async getAggregatedData(@Param('userId') userId: string): Promise<AggregatedTxData | null> {
    return await this.aggregatedDataService.getAggregatedDataByUserId(userId);
  }

  @Get('payouts/requested')
  async getRequestedPayouts(): Promise<AggregatedTxData[]> {
    return await this.aggregatedDataService.getRequestedPayouts();
  }
}
