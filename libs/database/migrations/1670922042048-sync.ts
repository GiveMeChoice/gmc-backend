import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670922042048 implements MigrationInterface {
  name = 'sync1670922042048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_refresh_reason_enum" AS ENUM('CREATED', 'STALE', 'PENDING', 'ADOPTED', 'MANUAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "refresh_reason" "public"."gmc_product_refresh_reason_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "refresh_reason"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_refresh_reason_enum"`,
    );
  }
}
