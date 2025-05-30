import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);
  await app.listen(3000);
}
bootstrap();
