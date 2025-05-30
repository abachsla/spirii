import { MigrationInterface, QueryRunner } from "typeorm";

export class AllMigration1748620433796 implements MigrationInterface {
    name = 'AllMigration1748620433796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "next_tx_window_load_query" ("id" SERIAL NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "pageNumber" integer, "pageCount" integer, CONSTRAINT "PK_f6843658115f14332e1921ee0c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('earned', 'spent', 'payout', 'paidOut')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL, "userId" character varying(255) NOT NULL, "originalCreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."transactions_type_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6bb58f2b6e30cb51a6504599f4" ON "transactions" ("userId") `);
        await queryRunner.query(`CREATE TABLE "aggregated_data" ("userId" character varying(255) NOT NULL, "balance" numeric(14,2) NOT NULL DEFAULT '0', "earned" numeric(14,2) NOT NULL DEFAULT '0', "spent" numeric(14,2) NOT NULL DEFAULT '0', "payout" numeric(14,2) NOT NULL DEFAULT '0', "paidout" numeric(14,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_572e11b4e9c5ba074e0401b9c9a" PRIMARY KEY ("userId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "aggregated_data"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bb58f2b6e30cb51a6504599f4"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "next_tx_window_load_query"`);
    }

}
