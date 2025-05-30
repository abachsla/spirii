import { TransactionDtoResponse } from './transaction.type';

export interface TxApiClient {
  loadTxWindow(
    startDate: Date,
    endDate: Date,
    pageNumber?: number | null,
    pageSize?: number | null,
  ): Promise<TransactionDtoResponse>;
}
