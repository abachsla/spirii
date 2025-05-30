import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TxEtlCron } from './cron/tx-etl-cron.service';
import { EtlService } from './service/etl.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NextDataWindowLoadQueryEntity } from './model/next-data-window-load-query.entity';
import { TxApiClientService } from './api/tx-api-client.service';
import { DummyTxApiClient } from './api/dummy/dummy-tx-api.client';
import { ConfigService } from '@nestjs/config';
import { FactTransactionEntity } from './model/fact-transaction.entity';
import { AggregatedDataService } from './service/aggregated-data.service';
import { AggregatedUserTxDataEntity } from './model/aggregated-user-tx-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FactTransactionEntity, AggregatedUserTxDataEntity, NextDataWindowLoadQueryEntity]),
  ],
  controllers: [],
  providers: [],
  exports: [AggregatedDataService],
})
export class EtlModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [];
    providers.push({
      provide: TxApiClientService,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (nodeEnv === 'development') {
          return new DummyTxApiClient();
        } else {
          return new TxApiClientService();
        }
      },
      inject: [ConfigService],
    });

    providers.push(TxEtlCron);
    providers.push(EtlService);
    providers.push(AggregatedDataService);
    return {
      module: EtlModule,
      providers: providers,
    };
  }
}
