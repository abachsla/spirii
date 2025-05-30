import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('aggregated_user_tx_data')
export class AggregatedUserTxDataEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  userId: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance: number = 0;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  earned: number = 0;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  spent: number = 0;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  payout: number = 0;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  paidout: number = 0;
}
