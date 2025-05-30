import { MigrationInterface, QueryRunner } from "typeorm";

export class AllMigration1748638236190 implements MigrationInterface {
    name = 'AllMigration1748638236190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "next_tx_window_load_query" ("id" SERIAL NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "pageNumber" integer, CONSTRAINT "PK_f6843658115f14332e1921ee0c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "aggregated_user_tx_data" ("userId" character varying(255) NOT NULL, "balance" numeric(14,2) NOT NULL DEFAULT '0', "earned" numeric(14,2) NOT NULL DEFAULT '0', "spent" numeric(14,2) NOT NULL DEFAULT '0', "payout" numeric(14,2) NOT NULL DEFAULT '0', "paidout" numeric(14,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_d6506c5db956f398fb967c367d3" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TYPE "public"."fact-transaction_type_enum" AS ENUM('earned', 'spent', 'payout', 'paidout')`);
        await queryRunner.query(`CREATE TABLE "fact-transaction" ("id" SERIAL NOT NULL, "userId" character varying(255) NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "type" "public"."fact-transaction_type_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, CONSTRAINT "PK_c63163b7ed1ea60aa8403ba7505" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_06799eeb4754e9ac70e30147ef" ON "fact-transaction" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_06799eeb4754e9ac70e30147ef"`);
        await queryRunner.query(`DROP TABLE "fact-transaction"`);
        await queryRunner.query(`DROP TYPE "public"."fact-transaction_type_enum"`);
        await queryRunner.query(`DROP TABLE "aggregated_user_tx_data"`);
        await queryRunner.query(`DROP TABLE "next_tx_window_load_query"`);
    }

}
