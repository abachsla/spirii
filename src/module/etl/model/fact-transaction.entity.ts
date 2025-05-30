import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  PAY_OUT = 'payout',
  PAID_OUT = 'paidout',
}

@Entity('fact-transaction')
export class FactTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @Column({ type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ type: 'enum', enum: Object.values(TransactionType) })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;
}
