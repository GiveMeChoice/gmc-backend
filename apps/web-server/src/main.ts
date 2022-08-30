import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WebServerModule } from './web-server.module';

async function bootstrap() {
  Logger.log('Starting GMC Web Server BETA');
  const app = await NestFactory.create(WebServerModule);
  await app.listen(3000);
}
bootstrap();
