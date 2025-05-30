import { DataSource } from 'typeorm';
import config from './orm.config';

export const AppDataSource = new DataSource(config);
