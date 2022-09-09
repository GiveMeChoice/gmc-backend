import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log('Starting Give Me Choice - Provider Integration Service (BETA)');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
