import { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as pg from 'pg';

// Hack to make typeorm to parse float values received from DB. For some reason numeric properties become string instead of number
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
pg.types.setTypeParser(1700, (v: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return parseFloat(v);
});

const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  synchronize: false,
  migrations: [path.join(__dirname, '..', 'migrations', '**', '*.ts')],
};

export default config;
