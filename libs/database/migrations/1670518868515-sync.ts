import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670518868515 implements MigrationInterface {
  name = 'sync1670518868515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gmc_category_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_eaaa5eb109c3284f0680353479e" UNIQUE ("name"), CONSTRAINT "PK_95168343cdf41db8df462d9ff0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" character varying NOT NULL, "title" character varying NOT NULL, "info_link" character varying, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "group_id" uuid, CONSTRAINT "PK_692bf98e94dc833f6a6f4a18874" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a0aa49273ed356a641af170cd8" ON "gmc_category" ("provider_id", "title") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" character varying NOT NULL, "title" character varying NOT NULL, "info_link" character varying, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b43e8521fc9a91b02f58d23f251" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_33432b63727d1e556e28d46a89" ON "gmc_brand" ("provider_id", "title") `,
    );
    await queryRunner.query(`ALTER TABLE "gmc_product" DROP COLUMN "brand_id"`);
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "brand_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "category_detail" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "gmc_product" ADD "brandId" uuid`);
    await queryRunner.query(`ALTER TABLE "gmc_product" ADD "categoryId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "gmc_category" ADD CONSTRAINT "FK_95168343cdf41db8df462d9ff0b" FOREIGN KEY ("group_id") REFERENCES "gmc_category_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_51f5478a1f49e99ccac76d3ee0f" FOREIGN KEY ("brandId") REFERENCES "gmc_brand"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_5b5928995a023e0293d074ba933" FOREIGN KEY ("categoryId") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_5b5928995a023e0293d074ba933"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_51f5478a1f49e99ccac76d3ee0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_category" DROP CONSTRAINT "FK_95168343cdf41db8df462d9ff0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "categoryId"`,
    );
    await queryRunner.query(`ALTER TABLE "gmc_product" DROP COLUMN "brandId"`);
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "category_detail"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "brand_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "brand_id" character varying`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33432b63727d1e556e28d46a89"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_brand"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0aa49273ed356a641af170cd8"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_category"`);
    await queryRunner.query(`DROP TABLE "gmc_category_group"`);
  }
}
