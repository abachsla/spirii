import { TransactionDto, TransactionDtoResponse } from '../transaction.type';
import { DummyTransactionsGenerator } from './DummyTransactionsGenerator';
import { TxApiClientService } from '../tx-api-client.service';
import { Logger } from '@nestjs/common';

export class DummyTxApiClient extends TxApiClientService {
  private readonly logger = new Logger(DummyTxApiClient.name);

  private readonly transactionsService: DummyTransactionsGenerator;

  public constructor() {
    super();
    this.transactionsService = new DummyTransactionsGenerator();
  }

  async loadTxWindow(
    startDate: Date,
    endDate: Date,
    pageNumber: number | null,
    pageSize: number | null,
  ): Promise<TransactionDtoResponse> {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw Error(`Please provide correct dates.`);
    }

    this.logger.log('Dummy TX Api client is used to provide transactions !');
    const transactionsInRange = this.transactionsService.getTransactions(startDate, endDate);

    const pn = pageNumber || 1;
    const ps = pageSize || 1000;

    let items: Array<TransactionDto> = [];
    const startIndex = (pn - 1) * ps;
    if (startIndex < transactionsInRange.length) {
      items = transactionsInRange.slice(startIndex, startIndex + ps);
    }

    return Promise.resolve({
      items,
      meta: {
        currentPage: pn,
        itemCount: items.length,
        itemsPerPage: ps,
        totalItems: transactionsInRange.length,
        totalPages: Math.ceil(transactionsInRange.length / ps) + 1,
      },
    });
  }
}
