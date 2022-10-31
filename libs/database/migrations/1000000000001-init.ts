import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1000000000001 implements MigrationInterface {
  name = 'init1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pi_provider_id_enum" AS ENUM('rainforest-api', 'ethical-superstore', 'kelkoo', 'tesco')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_status_enum" AS ENUM('incomplete', 'complete', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "providerId" "public"."pi_provider_id_enum" NOT NULL, "providerProductId" character varying NOT NULL, "status" "public"."gmc_product_status_enum" NOT NULL, "sku" character varying, "title" character varying, "rating" numeric(3,2), "ratingsTotal" integer, "price" numeric(10,2), "currency" character varying, "brandId" character varying, "brandName" character varying, "image" character varying, "link" character varying, "description" character varying, "createdBySourceRunId" character varying, "createdOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6e0408e4e723f1bb1f080b26cd8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_717c50283533409e51e68f4301" ON "gmc_product" ("providerId", "providerProductId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_provider" ("id" "public"."pi_provider_id_enum" NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_source_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "success" boolean NOT NULL DEFAULT true, "productsFound" integer NOT NULL DEFAULT '0', "productsCreated" integer NOT NULL DEFAULT '0', "error" character varying, "startedAt" TIMESTAMP NOT NULL, "completedAt" TIMESTAMP NOT NULL, "sourceId" uuid, CONSTRAINT "PK_594fb5cde1657d6334ce091c902" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_product_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "providerId" "public"."pi_provider_id_enum" NOT NULL, "identifier" character varying NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL, "category" character varying NOT NULL, "subcategory1" character varying NOT NULL, "subcategory2" character varying NOT NULL, CONSTRAINT "UQ_b047682fb5794da58697b29e31a" UNIQUE ("providerId", "identifier"), CONSTRAINT "PK_9cdb208469ea52aa2d4299193d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_source_run" ADD CONSTRAINT "FK_5653af76961679801380c3c9440" FOREIGN KEY ("sourceId") REFERENCES "pi_product_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ADD CONSTRAINT "FK_01132f38336a72c125992c161f8" FOREIGN KEY ("providerId") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.commitTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" DROP CONSTRAINT "FK_01132f38336a72c125992c161f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_source_run" DROP CONSTRAINT "FK_5653af76961679801380c3c9440"`,
    );
    await queryRunner.query(`DROP TABLE "pi_product_source"`);
    await queryRunner.query(`DROP TABLE "pi_source_run"`);
    await queryRunner.query(`DROP TABLE "pi_provider"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_717c50283533409e51e68f4301"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_product"`);
    await queryRunner.query(`DROP TYPE "public"."gmc_product_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."pi_provider_id_enum"`);
    await queryRunner.commitTransaction();
  }
}
