import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ProviderIntegrationModule } from './provider-integration.module';

async function bootstrap() {
  Logger.log('Starting GMC Provider Integration Service (BETA)');
  const app = await NestFactory.create(ProviderIntegrationModule);
  await app.listen(3000);
}
bootstrap();
