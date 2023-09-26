import { DataSource, Db } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: process.env['datasource.port']
    ? Number(process.env['datasource.port'])
    : 5432,
  username: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'password',
  database: process.env['datasource.databse'] || 'gmc_db',
  migrations: ['./libs/database/migrations/**/*.ts'],
  entities: ['./**/*.entity.*'],
  migrationsTransactionMode: 'each',
});
