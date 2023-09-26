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

const logger = new Logger('Main=>bootstrap()');

async function bootstrap() {
  logger.log('Starting Give Me Choice - Provider Integration Service (BETA)');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['log', 'debug', 'error', 'verbose', 'warn']
        : ['log', 'error', 'warn'],
  });
  app.enableCors({
    origin: '*',
  });
  // exception filter
  app.useGlobalFilters(new GlobalExceptionsFilter());
  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        logger.error(JSON.stringify(validationErrors));
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
  logger.log('starting api');
  const port = configService.get('app.port', 5002);
  await app.listen(port);
  logger.log(`app api started, listening on port: ${port}`);
}
bootstrap();
