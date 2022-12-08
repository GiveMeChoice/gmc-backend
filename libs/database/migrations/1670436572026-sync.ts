import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670436572026 implements MigrationInterface {
  name = 'sync1670436572026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_label" ADD "info_link" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gmc_label" DROP COLUMN "info_link"`);
  }
}
