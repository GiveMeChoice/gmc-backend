import { DataSource, Db } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const MigrationDataSource = new DataSource({
  type: 'postgres',
  host: process.env['datasource.host'] || 'localhost',
  port: process.env['datasource.port']
    ? Number(process.env['datasource.port'])
    : 5432,
  username: process.env['datasource.username'] || 'postgres',
  password: process.env['datasource.password'] || 'password',
  database: process.env['datasource.databse'] || 'gmc_db',
  migrations: ['./libs/database/migrations/*.ts'],
  entities: ['./**/*.entity.*'],
});
