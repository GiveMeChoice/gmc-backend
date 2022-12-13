import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670933877435 implements MigrationInterface {
  name = 'sync1670933877435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "shipping_price" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "shipping_price"`,
    );
  }
}
