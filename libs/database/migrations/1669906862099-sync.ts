import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1669906862099 implements MigrationInterface {
  name = 'sync1669906862099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" ADD "foreign_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" ADD "pending_count" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" DROP COLUMN "pending_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" DROP COLUMN "foreign_count"`,
    );
  }
}
