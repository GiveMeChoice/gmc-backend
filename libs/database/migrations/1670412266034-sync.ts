import { MigrationInterface, QueryRunner } from "typeorm";

export class sync1670412266034 implements MigrationInterface {
    name = 'sync1670412266034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gmc_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" character varying NOT NULL, "title" character varying NOT NULL, "icon" character varying, "description" character varying, CONSTRAINT "PK_5ce50b41965194384818bf3ae6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_738155f83c2923811c28c9ba2c" ON "gmc_label" ("provider_id", "title") `);
        await queryRunner.query(`CREATE TABLE "gmc_product_label" ("product" uuid NOT NULL, "label" uuid NOT NULL, CONSTRAINT "PK_81d074d222ddbc4be613ddf6e88" PRIMARY KEY ("product", "label"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7379359c335452adfc292b944" ON "gmc_product_label" ("product") `);
        await queryRunner.query(`CREATE INDEX "IDX_9db3b794cac4e64cb40bff761c" ON "gmc_product_label" ("label") `);
        await queryRunner.query(`ALTER TYPE "public"."pi_product_source_status_enum" RENAME TO "pi_product_source_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."pi_product_source_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" TYPE "public"."pi_product_source_status_enum" USING "status"::"text"::"public"."pi_product_source_status_enum"`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" SET DEFAULT 'READY'`);
        await queryRunner.query(`DROP TYPE "public"."pi_product_source_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."gmc_product_integration_status_enum" RENAME TO "gmc_product_integration_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."gmc_product_integration_status_enum" AS ENUM('PENDING', 'LIVE', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ALTER COLUMN "integration_status" TYPE "public"."gmc_product_integration_status_enum" USING "integration_status"::"text"::"public"."gmc_product_integration_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."gmc_product_integration_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_c7379359c335452adfc292b9446" FOREIGN KEY ("product") REFERENCES "gmc_product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb" FOREIGN KEY ("label") REFERENCES "gmc_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb"`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_c7379359c335452adfc292b9446"`);
        await queryRunner.query(`CREATE TYPE "public"."gmc_product_integration_status_enum_old" AS ENUM('PENDING', 'LIVE', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ALTER COLUMN "integration_status" TYPE "public"."gmc_product_integration_status_enum_old" USING "integration_status"::"text"::"public"."gmc_product_integration_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."gmc_product_integration_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."gmc_product_integration_status_enum_old" RENAME TO "gmc_product_integration_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."pi_product_source_status_enum_old" AS ENUM('READY', 'BUSY', 'DOWN')`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" TYPE "public"."pi_product_source_status_enum_old" USING "status"::"text"::"public"."pi_product_source_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "pi_product_source" ALTER COLUMN "status" SET DEFAULT 'READY'`);
        await queryRunner.query(`DROP TYPE "public"."pi_product_source_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."pi_product_source_status_enum_old" RENAME TO "pi_product_source_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9db3b794cac4e64cb40bff761c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7379359c335452adfc292b944"`);
        await queryRunner.query(`DROP TABLE "gmc_product_label"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_738155f83c2923811c28c9ba2c"`);
        await queryRunner.query(`DROP TABLE "gmc_label"`);
    }

}
