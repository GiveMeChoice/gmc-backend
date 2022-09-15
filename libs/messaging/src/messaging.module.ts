import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_EXCHANGE } from './messaging.constants';

@Module({
  imports: [
    // RabbitMQModule.forRootAsync(RabbitMQModule, {
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     Logger.debug(configService.get('rabbitmq.uri'));
    //     return {
    //       exchanges: [
    //         {
    //           name: DEFAULT_EXCHANGE,
    //           type: 'topic',
    //         },
    //       ],
    //       uri: configService.get('rabbitmq.uri'),
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
  ],
  providers: [],
  exports: [],
})
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
          uri: configService.get('rabbitmq.uri'),
        };
      },
      inject: [ConfigService],
    });
  }
}
