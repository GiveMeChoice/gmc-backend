import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log('Starting Give Me Choice - Provider Integration Service (BETA)');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('app.port', 3000));
}
bootstrap();
