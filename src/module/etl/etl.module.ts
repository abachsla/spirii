import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TxEtlCron } from './service/cron/tx-etl-cron.service';
import { EtlService } from './service/etl.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NextDataWindowLoadQueryEntity } from './model/next-data-window-load-query.entity';
import { TxApiClientService } from './service/tx-api-client.service';
import { DummyTxApiClient } from './api/dummy/dummy-tx-api.client';
import { ConfigService } from '@nestjs/config';
import { CoreModule } from '../core/core.module';


@Module({
  imports: [TypeOrmModule.forFeature([NextDataWindowLoadQueryEntity]), CoreModule],
  controllers: [],
  providers: [],
  exports: [],
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
    return {
      module: EtlModule,
      providers: providers,
    };
  }
}
