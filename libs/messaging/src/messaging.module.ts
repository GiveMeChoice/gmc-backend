import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_EXCHANGE } from './messaging.constants';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
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
            'channel-low': {
              prefetchCount:
                configService.get<number>(
                  'rabbitmq.prefetch-count.channel-low',
                ) || 1,
            },
            'channel-mid': {
              prefetchCount:
                configService.get<number>(
                  'rabbitmq.prefetch-count.channel-mid',
                ) || 2,
              default: true,
            },
            'channel-high': {
              prefetchCount:
                configService.get<number>(
                  'rabbitmq.prefetch-count.channel-high',
                ) || 5,
            },
          },
          uri: configService.get('rabbitmq.uri'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
