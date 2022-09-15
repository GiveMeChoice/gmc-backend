import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log('Starting Give Me Choice - Provider Integration Service (BETA)');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  Logger.log('starting microservices');
  await app.startAllMicroservices();
  Logger.log('microservices started');
  Logger.log('starting api');
  await app.listen(configService.get('app.port', 3000));
  Logger.log('api started');
}
bootstrap();
