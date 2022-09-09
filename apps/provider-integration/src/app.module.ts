import { ProductsModule } from '@app/products';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProvidersModule } from './providers/providers.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('datasource.host'),
        port: +configService.get('datasource.port'),
        username: configService.get('datasource.username'),
        password: configService.get('datasource.password'),
        database: configService.get('datasource.database'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'dev',
      }),
      inject: [ConfigService],
    }),
    // libraries
    ProductsModule,
    // local
    ProvidersModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
