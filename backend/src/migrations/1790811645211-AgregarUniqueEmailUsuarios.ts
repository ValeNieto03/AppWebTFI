import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarUniqueEmailUsuarios1790811645211
    implements MigrationInterface {
    name = 'AgregarUniqueEmailUsuarios1790811645211';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "usuarios"
            ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5"
            UNIQUE ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "usuarios"
            DROP CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5"
        `);
    }
}