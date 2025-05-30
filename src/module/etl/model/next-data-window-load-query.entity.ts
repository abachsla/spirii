import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'next_tx_window_load_query' })
export class NextDataWindowLoadQueryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  startDate: Date;

  @Column({ nullable: false })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  pageNumber: number | null;
}
