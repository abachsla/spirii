import { TxApiClient } from './tx-api.client';
import { Promise } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { TransactionDtoResponse } from './transaction.type';

@Injectable()
export class TxApiClientService implements TxApiClient {
  /**
   * FIXME Add implementation using AXIOS
   */
  public loadTxWindow(startDate: Date, endDate: Date, pageNumber: number | null, pageSize: number | null): Promise<TransactionDtoResponse> {
    return Promise.resolve({
      items: [],
      meta: {
        currentPage: pageNumber || 1,
        itemCount: 0,
        itemsPerPage: pageSize || 1000,
        totalItems: 0,
        totalPages: 0,
      },
    });
  }
}
