import { TransactionDto, TransactionDtoType } from '../transaction.type';
import { mockTransactionId } from '../../utils/mock-utils';
import { Logger } from '@nestjs/common';

export class DummyTransactionsGenerator {
  private readonly logger = new Logger(DummyTransactionsGenerator.name);

  private readonly _userIds: Array<string> = Array.from(Array(200).keys()).map(id => '' + (id + 1));
  private readonly transactions: TransactionDto[] = [];

  constructor() {
    // To mock transactions and support pagination properly, will generate random amount of
    // transactions every 12 seconds.
    setInterval(() => {
      this.cleanupTransactions();
      this.generateTransactions();
    }, 12000);
  }

  getTransactions($startDate: Date, $endDate: Date) {
    return this.transactions.filter(transaction => {
      return (
        transaction.createdAt.getTime() >= $startDate.getTime() && transaction.createdAt.getTime() <= $endDate.getTime()
      );
    });
  }

  private generateTransactions() {
    this.logger.log('Generating dummy transaction list');
    let numOfTransaction = (1000 * Math.random()) >> 0;
    while (numOfTransaction--) {
      const id: string = mockTransactionId();
      this.transactions.push({
        id,
        createdAt: new Date(),
        amount: ((100 * Math.random()) >> 0) * 0.01,
        userId: this._userIds[(this._userIds.length * Math.random()) >> 0],
        type: [TransactionDtoType.EARNED, TransactionDtoType.PAYOUT, TransactionDtoType.SPENT][
          (3 * Math.random()) >> 0
        ],
      });
    }
  }

  private cleanupTransactions() {
    const minimalCreatedTime = Date.now() - 1000 * 60 * 10;
    // Remove transactions older than 2 minutes
    while (this.transactions.length > 0 && this.transactions[0].createdAt.getTime() < minimalCreatedTime) {
      this.transactions.shift();
    }
  }
}
