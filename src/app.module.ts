import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './orm/orm.config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from './module/core/core.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EtlModule } from './module/etl/etl.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/?replicaSet=rs0'),
    TypeOrmModule.forRoot(ormConfig),
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production', '.env'],
      isGlobal: true,
    }),
    CoreModule,
    EtlModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  providers: [],
})
export class AppModule {}
