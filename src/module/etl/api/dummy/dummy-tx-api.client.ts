import { TxApiClient } from '../tx-api.client';
import { TransactionDto, TransactionDtoResponse } from '../transaction.type';
import { DummyTransactionsService } from './dummy-transactions.service';
import { TxApiClientService } from '../../service/tx-api-client.service';

export class DummyTxApiClient extends TxApiClientService {
  private readonly transactionsService: DummyTransactionsService

  public constructor() {
    super();
    this.transactionsService = new DummyTransactionsService();
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
        totalPages: Math.ceil(transactionsInRange.length / ps),
      },
    });
  }
}
