import { DataSourceOptions } from 'typeorm';
import * as path from 'path';

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
