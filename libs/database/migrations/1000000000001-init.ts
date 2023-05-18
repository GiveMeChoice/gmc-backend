import { MigrationInterface, QueryRunner } from "typeorm";

export class init1000000000001 implements MigrationInterface {
    name = 'init1000000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gmc_label_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "PK_b2f859a1d0d7249a702d8d8c4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gmc_merchant_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "info_link" character varying, "logo_url" character varying, "group_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cac164e288509ca2f4974bbeb5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_275cc18c65522c5e5d9b77e34b" ON "gmc_merchant_label" ("merchant_id", "code") `);
        await queryRunner.query(`CREATE TYPE "public"."pi_provider_id_enum" AS ENUM('rainforest-api-uk', 'ethical-superstore-web', 'kelkoo', 'tesco')`);
        await queryRunner.query(`CREATE TABLE "pi_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."pi_provider_id_enum" NOT NULL, "merchant_id" uuid NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer NOT NULL DEFAULT '24', "expiration_hours" integer NOT NULL DEFAULT '36', CONSTRAINT "UQ_5b9bbfad750c2f497b4c52e880f" UNIQUE ("key"), CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pi_source_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_id" uuid NOT NULL, "found_count" integer NOT NULL DEFAULT '0', "owned_count" integer NOT NULL DEFAULT '0', "created_count" integer NOT NULL DEFAULT '0', "adopted_count" integer NOT NULL DEFAULT '0', "foreign_count" integer NOT NULL DEFAULT '0', "pending_count" integer NOT NULL DEFAULT '0', "stale_count" integer NOT NULL DEFAULT '0', "keep_alive_signal_count" integer NOT NULL DEFAULT '0', "refresh_signal_count" integer NOT NULL DEFAULT '0', "failure_count" integer NOT NULL DEFAULT '0', "run_at" TIMESTAMP WITH TIME ZONE NOT NULL, "source_date" TIMESTAMP WITH TIME ZONE, "run_time" numeric(10,2), "error_message" character varying, CONSTRAINT "PK_594fb5cde1657d6334ce091c902" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pi_product_source_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`);
        await queryRunner.query(`CREATE TABLE "pi_provider_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "identifier" character varying NOT NULL, "status" "public"."pi_product_source_status_enum" NOT NULL DEFAULT 'READY', "description" character varying, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer, "expiration_hours" integer, "last_run_at" TIMESTAMP WITH TIME ZONE, "owned_count" integer NOT NULL DEFAULT '0', "retry_count" integer NOT NULL DEFAULT '0', "retry_limit" integer NOT NULL DEFAULT '4', "category" character varying, "source_link" character varying, CONSTRAINT "UQ_3f9c54b87a1747f519d10598ba0" UNIQUE ("provider_id", "identifier"), CONSTRAINT "PK_780875a50e60f82d4fb3d732ef3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gmc_product_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author" character varying NOT NULL, "text" character varying NOT NULL, "rating" numeric(3,2), "submitted_on" TIMESTAMP WITH TIME ZONE NOT NULL, "productId" uuid, CONSTRAINT "PK_a43e2215ae2ffb06192720755fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."gmc_product_integration_status_enum" AS ENUM('PENDING', 'LIVE', 'REMAP', 'EXPIRED')`);
        await queryRunner.query(`CREATE TYPE "public"."gmc_product_refresh_reason_enum" AS ENUM('CREATED', 'OFFER_UPDATED', 'PENDING_RESEND', 'ADOPTED', 'EXPIRED', 'REQUESTED')`);
        await queryRunner.query(`CREATE TABLE "gmc_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "merchant_product_id" character varying NOT NULL, "short_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "integration_status" "public"."gmc_product_integration_status_enum" NOT NULL, "source_id" uuid NOT NULL, "created_by_run_id" character varying NOT NULL, "refreshed_by_run_id" character varying, "refreshed_at" TIMESTAMP WITH TIME ZONE, "refresh_reason" "public"."gmc_product_refresh_reason_enum", "source_date" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "keep_alive_count" integer NOT NULL DEFAULT '0', "has_integration_error" boolean NOT NULL DEFAULT false, "error_message" character varying, "sku" character varying, "title" character varying, "description" character varying, "rating" numeric(3,2), "ratings_total" integer, "price" numeric(10,2), "shipping_price" numeric(10,2), "currency" character varying, "list_image" character varying, "main_image" character varying, "secondary_image" character varying, "offer_link" character varying, "merchantBrandId" uuid, "merchantCategoryId" uuid, CONSTRAINT "UQ_67f713819b7224ab9808b08a5a1" UNIQUE ("short_id"), CONSTRAINT "PK_6e0408e4e723f1bb1f080b26cd8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_178fc2a35c59d3921f7754b255" ON "gmc_product" ("merchant_id", "merchant_product_id") `);
        await queryRunner.query(`CREATE TABLE "gmc_merchant_brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "logo_url" character varying, "info_link" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_90599315db7fda681cf2cda6392" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0f36e8396920bf67059b07497f" ON "gmc_merchant_brand" ("merchant_id", "code") `);
        await queryRunner.query(`CREATE TYPE "public"."gmc_merchant_key_enum" AS ENUM('amazon-uk', 'ethical-superstore')`);
        await queryRunner.query(`CREATE TABLE "gmc_merchant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."gmc_merchant_key_enum" NOT NULL, "name" character varying NOT NULL, "description" character varying, "logo_url" character varying, "info_link" character varying, CONSTRAINT "PK_d6198badf7ddfae44e7acc8d547" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gmc_merchant_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" uuid, CONSTRAINT "PK_3c06864a73d687f547c4a86150e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9bb7dcca42d74d3f5aed3f4ba2" ON "gmc_merchant_category" ("merchant_id", "code") `);
        await queryRunner.query(`CREATE TABLE "gmc_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "PK_692bf98e94dc833f6a6f4a18874" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gmc_product_label" ("product" uuid NOT NULL, "label" uuid NOT NULL, CONSTRAINT "PK_81d074d222ddbc4be613ddf6e88" PRIMARY KEY ("product", "label"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c7379359c335452adfc292b944" ON "gmc_product_label" ("product") `);
        await queryRunner.query(`CREATE INDEX "IDX_9db3b794cac4e64cb40bff761c" ON "gmc_product_label" ("label") `);
        await queryRunner.query(`ALTER TABLE "gmc_label_group" ADD CONSTRAINT "FK_4a9bc2dd2adfb96278cdeb7a5a2" FOREIGN KEY ("parentId") REFERENCES "gmc_label_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_label" ADD CONSTRAINT "FK_72730ae70f1cc395eadb713edbd" FOREIGN KEY ("merchant_id") REFERENCES "gmc_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_label" ADD CONSTRAINT "FK_494f689f54112b4936f492e9c86" FOREIGN KEY ("group_id") REFERENCES "gmc_label_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pi_provider" ADD CONSTRAINT "FK_d472c2799697b8d4fc52bb60c08" FOREIGN KEY ("merchant_id") REFERENCES "gmc_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pi_source_run" ADD CONSTRAINT "FK_ebdbcb0171e887ea924806c0395" FOREIGN KEY ("source_id") REFERENCES "pi_provider_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pi_provider_source" ADD CONSTRAINT "FK_54ea75fd22ac1a0158926c265f8" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_product_review" ADD CONSTRAINT "FK_719f3f696804dffa22edbf002d7" FOREIGN KEY ("productId") REFERENCES "gmc_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_2ff7af6931960ecba679d48e4e2" FOREIGN KEY ("merchant_id") REFERENCES "gmc_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a" FOREIGN KEY ("source_id") REFERENCES "pi_provider_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_848d3d67e84326ddbbf4e8ff0cb" FOREIGN KEY ("merchantBrandId") REFERENCES "gmc_merchant_brand"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_3ea1317a7d3ec5309439d5f0c6f" FOREIGN KEY ("merchantCategoryId") REFERENCES "gmc_merchant_category"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_brand" ADD CONSTRAINT "FK_ee4814330f02cd963d6d5c652df" FOREIGN KEY ("merchant_id") REFERENCES "gmc_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_category" ADD CONSTRAINT "FK_047e84133d8c531047a2329aefa" FOREIGN KEY ("merchant_id") REFERENCES "gmc_merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_category" ADD CONSTRAINT "FK_2a2c6eb1369f24cea09702eb25b" FOREIGN KEY ("category_id") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_category" ADD CONSTRAINT "FK_e0e212c79589c59aad742fec239" FOREIGN KEY ("parentId") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_c7379359c335452adfc292b9446" FOREIGN KEY ("product") REFERENCES "gmc_product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb" FOREIGN KEY ("label") REFERENCES "gmc_merchant_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb"`);
        await queryRunner.query(`ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_c7379359c335452adfc292b9446"`);
        await queryRunner.query(`ALTER TABLE "gmc_category" DROP CONSTRAINT "FK_e0e212c79589c59aad742fec239"`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_category" DROP CONSTRAINT "FK_2a2c6eb1369f24cea09702eb25b"`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_category" DROP CONSTRAINT "FK_047e84133d8c531047a2329aefa"`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_brand" DROP CONSTRAINT "FK_ee4814330f02cd963d6d5c652df"`);
        await queryRunner.query(`ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_3ea1317a7d3ec5309439d5f0c6f"`);
        await queryRunner.query(`ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_848d3d67e84326ddbbf4e8ff0cb"`);
        await queryRunner.query(`ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a"`);
        await queryRunner.query(`ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_2ff7af6931960ecba679d48e4e2"`);
        await queryRunner.query(`ALTER TABLE "gmc_product_review" DROP CONSTRAINT "FK_719f3f696804dffa22edbf002d7"`);
        await queryRunner.query(`ALTER TABLE "pi_provider_source" DROP CONSTRAINT "FK_54ea75fd22ac1a0158926c265f8"`);
        await queryRunner.query(`ALTER TABLE "pi_source_run" DROP CONSTRAINT "FK_ebdbcb0171e887ea924806c0395"`);
        await queryRunner.query(`ALTER TABLE "pi_provider" DROP CONSTRAINT "FK_d472c2799697b8d4fc52bb60c08"`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_label" DROP CONSTRAINT "FK_494f689f54112b4936f492e9c86"`);
        await queryRunner.query(`ALTER TABLE "gmc_merchant_label" DROP CONSTRAINT "FK_72730ae70f1cc395eadb713edbd"`);
        await queryRunner.query(`ALTER TABLE "gmc_label_group" DROP CONSTRAINT "FK_4a9bc2dd2adfb96278cdeb7a5a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9db3b794cac4e64cb40bff761c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7379359c335452adfc292b944"`);
        await queryRunner.query(`DROP TABLE "gmc_product_label"`);
        await queryRunner.query(`DROP TABLE "gmc_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bb7dcca42d74d3f5aed3f4ba2"`);
        await queryRunner.query(`DROP TABLE "gmc_merchant_category"`);
        await queryRunner.query(`DROP TABLE "gmc_merchant"`);
        await queryRunner.query(`DROP TYPE "public"."gmc_merchant_key_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f36e8396920bf67059b07497f"`);
        await queryRunner.query(`DROP TABLE "gmc_merchant_brand"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178fc2a35c59d3921f7754b255"`);
        await queryRunner.query(`DROP TABLE "gmc_product"`);
        await queryRunner.query(`DROP TYPE "public"."gmc_product_refresh_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."gmc_product_integration_status_enum"`);
        await queryRunner.query(`DROP TABLE "gmc_product_review"`);
        await queryRunner.query(`DROP TABLE "pi_provider_source"`);
        await queryRunner.query(`DROP TYPE "public"."pi_product_source_status_enum"`);
        await queryRunner.query(`DROP TABLE "pi_source_run"`);
        await queryRunner.query(`DROP TABLE "pi_provider"`);
        await queryRunner.query(`DROP TYPE "public"."pi_provider_id_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_275cc18c65522c5e5d9b77e34b"`);
        await queryRunner.query(`DROP TABLE "gmc_merchant_label"`);
        await queryRunner.query(`DROP TABLE "gmc_label_group"`);
    }

}
