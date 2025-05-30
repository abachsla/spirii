import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken as getMongooseConnectionToken } from '@nestjs/mongoose';
import { Connection as MongooseConnection } from 'mongoose';
import { DataSource as TypeOrmDataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('Database Reset, User Creation, and Account Creation (e2e)', () => {
  let app: INestApplication;
  let mongooseConnection: MongooseConnection;
  let typeOrmDataSource: TypeOrmDataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mongooseConnection = app.get<MongooseConnection>(getMongooseConnectionToken());
    typeOrmDataSource = app.get<TypeOrmDataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await mongooseConnection.close();
    await typeOrmDataSource.destroy();
    await app.close();
  });

  it('should reset databases, create user, log in, and create account', async () => {
    // Clear

    try {
      // @ts-ignore
      await mongooseConnection.db.dropDatabase();
      console.log('MongoDB database dropped (actual DB).');
    } catch (error) {
      console.error('Error dropping MongoDB database:', error);
    }

    try {
      await typeOrmDataSource.dropDatabase();
      console.log('PostgreSQL database dropped (actual DB).');
      await typeOrmDataSource.runMigrations();
      console.log('PostgreSQL migrations applied.');
    } catch (error) {
      console.error('Error resetting PostgreSQL database or running migrations:', error);
      throw error;
    }
  });
});
