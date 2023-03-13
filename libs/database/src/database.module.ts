import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
        synchronize: false,
        // migrationsRun: configService.get('datasource.migrate'),
        // migrations: ['./libs/database/migrations/*.ts'],
        // migrationsTransactionMode: 'each',
        // logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
