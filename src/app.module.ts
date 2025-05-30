import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './orm/orm.config';
import { MongooseModule } from '@nestjs/mongoose';
import { FrontModule } from './module/front/frontModule';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/?replicaSet=rs0'),
    TypeOrmModule.forRoot(ormConfig),
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production', '.env'],
      isGlobal: true,
    }),
    FrontModule,
    ScheduleModule.forRoot(),
  ],
  providers: [],
})
export class AppModule {}
