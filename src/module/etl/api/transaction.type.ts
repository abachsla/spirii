export enum TransactionDtoType {
  PAYOUT = 'payout',
  SPENT = 'spent',
  EARNED = 'earned',
  PAIDOUT = 'paidout',
}

export type TransactionDto = {
  id: string;
  userId: string;
  createdAt: Date;
  type: TransactionDtoType;
  amount: number;
};

export type TransactionDtoResponse = {
  items: Array<TransactionDto>;
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};
