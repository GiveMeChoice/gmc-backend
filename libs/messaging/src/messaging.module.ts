import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_EXCHANGE } from './messaging.constants';

@Module({})
export class MessagingModule {
  static register(): DynamicModule {
    return RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        Logger.debug(configService.get('rabbitmq.uri'));
        return {
          exchanges: [
            {
              name: DEFAULT_EXCHANGE,
              type: 'topic',
            },
          ],
          channels: {
            'channel-1': {
              prefetchCount:
                configService.get<number>('rabbitmq.prefetch-count') || 5,
              default: true,
            },
          },
          uri: configService.get('rabbitmq.uri'),
        };
      },
      inject: [ConfigService],
    });
  }
}
