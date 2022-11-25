import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './utils/global-exceptions.filter';

async function bootstrap() {
  Logger.log('Starting Give Me Choice - Provider Integration Service (BETA)');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  // exception filter
  app.useGlobalFilters(new GlobalExceptionsFilter());
  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        Logger.error(JSON.stringify(validationErrors));
        let errMsg = '';
        validationErrors.forEach((valErr) => {
          errMsg += `Invalid ${valErr.property}; `;
        });
        return new BadRequestException(errMsg);
      },
      whitelist: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  Logger.log('starting api');
  await app.listen(configService.get('app.port', 3000));
  Logger.log('api started');
}
bootstrap();
