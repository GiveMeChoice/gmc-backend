import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1000000000001 implements MigrationInterface {
  name = 'init1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pi_provider_id_enum" AS ENUM('rainforest-api', 'ethical-superstore', 'kelkoo', 'tesco')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."pi_provider_id_enum" NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_5b9bbfad750c2f497b4c52e880f" UNIQUE ("key"), CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_source_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "completed" boolean NOT NULL DEFAULT true, "errorMessage" character varying, "productsFound" integer NOT NULL DEFAULT '0', "productsCreated" integer NOT NULL DEFAULT '0', "productsRefreshed" integer NOT NULL DEFAULT '0', "productFailures" integer NOT NULL DEFAULT '0', "startedAt" TIMESTAMP NOT NULL, "completedAt" TIMESTAMP NOT NULL, "sourceId" uuid, CONSTRAINT "PK_594fb5cde1657d6334ce091c902" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_product_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "providerId" uuid NOT NULL, "identifier" character varying NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "integrationInterval" integer NOT NULL DEFAULT '0', "nextIntegrationDue" TIMESTAMP NOT NULL DEFAULT '"2022-11-01T15:15:25.215Z"', "category" character varying NOT NULL, "subcategory1" character varying NOT NULL, "subcategory2" character varying NOT NULL, CONSTRAINT "UQ_b047682fb5794da58697b29e31a" UNIQUE ("providerId", "identifier"), CONSTRAINT "PK_9cdb208469ea52aa2d4299193d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_status_enum" AS ENUM('incomplete', 'complete', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "providerKey" character varying NOT NULL, "providerProductId" character varying NOT NULL, "shortId" character varying NOT NULL, "status" "public"."gmc_product_status_enum" NOT NULL, "statusAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productSourceId" character varying NOT NULL, "lastRefreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "lastRefreshedBy" character varying NOT NULL, "lastFoundAt" TIMESTAMP WITH TIME ZONE NOT NULL, "lastFoundBy" character varying NOT NULL, "sku" character varying, "title" character varying, "description" character varying, "rating" numeric(3,2), "ratingsTotal" integer, "price" numeric(10,2), "currency" character varying, "brandId" character varying, "brandName" character varying, "image" character varying, "link" character varying, "createdBySourceRunId" character varying, CONSTRAINT "UQ_1f99bf5eb222ffba56d56b7d19a" UNIQUE ("shortId"), CONSTRAINT "PK_6e0408e4e723f1bb1f080b26cd8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_927b5dc46e91c7e5a16d2f308e" ON "gmc_product" ("providerKey", "providerProductId") `,
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
    await queryRunner.query(
      `DROP INDEX "public"."IDX_927b5dc46e91c7e5a16d2f308e"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_product"`);
    await queryRunner.query(`DROP TYPE "public"."gmc_product_status_enum"`);
    await queryRunner.query(`DROP TABLE "pi_product_source"`);
    await queryRunner.query(`DROP TABLE "pi_source_run"`);
    await queryRunner.query(`DROP TABLE "pi_provider"`);
    await queryRunner.query(`DROP TYPE "public"."pi_provider_id_enum"`);
    await queryRunner.commitTransaction();
  }
}
