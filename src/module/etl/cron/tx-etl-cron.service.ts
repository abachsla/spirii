import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EtlService } from '../service/etl.service';

@Injectable()
export class TxEtlCron {
  private readonly logger = new Logger(TxEtlCron.name);

  constructor(private readonly etlService: EtlService) {}

  @Cron('*/12 * * * * *')
  async run() {
    this.logger.log('Starting to load TXs from transaction API');
    await this.etlService.loadNextTxWindow();
  }
}
