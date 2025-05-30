import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  PAY_OUT = 'payout',
  PAID_OUT = 'paidOut',
}

@Entity('transactions')
export class Transaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  originalCreatedAt: Date;

  @Column({ type: 'enum', enum: ['earned', 'spent', 'payout', 'paidOut'] })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;
}
