import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670522602494 implements MigrationInterface {
  name = 'sync1670522602494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_brand" ADD "logo" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gmc_brand" DROP COLUMN "logo"`);
  }
}
