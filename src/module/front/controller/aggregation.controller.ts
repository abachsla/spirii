import { Controller, Get, Logger, Param, ParseDatePipe, Query } from '@nestjs/common';
import { AggregatedDataService } from '../../etl/service/aggregated-data.service';
import { AggregatedUserTxDataEntity } from '../../etl/model/aggregated-user-tx-data.entity';

@Controller('aggregated-data')
export class AggregationController {
  private readonly logger = new Logger(AggregationController.name);

  constructor(private readonly aggregatedDataService: AggregatedDataService) {}

  @Get(':userId')
  async getAggregatedData(@Param('userId') userId: string): Promise<AggregatedUserTxDataEntity | null> {
    return await this.aggregatedDataService.getAggregatedDataByUserId(userId);
  }

  @Get(':userId/payouts')
  async getRequestedPayouts(
    @Param('userId') userId: string,
    @Query('startDate', new ParseDatePipe()) starDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
  ): Promise<{ userId: string; amount: number }> {
    this.logger.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', starDate, endDate);
    return await this.aggregatedDataService.getRequestedPayouts(userId, starDate, endDate);
  }
}
