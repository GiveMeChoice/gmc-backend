import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670945289633 implements MigrationInterface {
  name = 'sync1670945289633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_brand" ADD "info" character varying`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pi_product_source_status_enum" RENAME TO "pi_product_source_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_product_source_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" TYPE "public"."pi_product_source_status_enum" USING "status"::"text"::"public"."pi_product_source_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" SET DEFAULT 'READY'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."pi_product_source_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."gmc_product_integration_status_enum" RENAME TO "gmc_product_integration_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_integration_status_enum" AS ENUM('PENDING', 'LIVE', 'EXPIRED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ALTER COLUMN "integration_status" TYPE "public"."gmc_product_integration_status_enum" USING "integration_status"::"text"::"public"."gmc_product_integration_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_integration_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."gmc_product_refresh_reason_enum" RENAME TO "gmc_product_refresh_reason_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_refresh_reason_enum" AS ENUM('CREATED', 'STALE', 'PENDING', 'ADOPTED', 'MANUAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ALTER COLUMN "refresh_reason" TYPE "public"."gmc_product_refresh_reason_enum" USING "refresh_reason"::"text"::"public"."gmc_product_refresh_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_refresh_reason_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_refresh_reason_enum_old" AS ENUM('CREATED', 'STALE', 'PENDING', 'ADOPTED', 'MANUAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ALTER COLUMN "refresh_reason" TYPE "public"."gmc_product_refresh_reason_enum_old" USING "refresh_reason"::"text"::"public"."gmc_product_refresh_reason_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_refresh_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."gmc_product_refresh_reason_enum_old" RENAME TO "gmc_product_refresh_reason_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_integration_status_enum_old" AS ENUM('PENDING', 'LIVE', 'EXPIRED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ALTER COLUMN "integration_status" TYPE "public"."gmc_product_integration_status_enum_old" USING "integration_status"::"text"::"public"."gmc_product_integration_status_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_integration_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."gmc_product_integration_status_enum_old" RENAME TO "gmc_product_integration_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_product_source_status_enum_old" AS ENUM('READY', 'BUSY', 'DOWN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" TYPE "public"."pi_product_source_status_enum_old" USING "status"::"text"::"public"."pi_product_source_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ALTER COLUMN "status" SET DEFAULT 'READY'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."pi_product_source_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."pi_product_source_status_enum_old" RENAME TO "pi_product_source_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "gmc_brand" DROP COLUMN "info"`);
  }
}
