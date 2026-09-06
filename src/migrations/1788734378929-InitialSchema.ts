import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788734378929 implements MigrationInterface {
    name = 'InitialSchema1788734378929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."usuarios_estado_enum" AS ENUM('activo', 'baja')`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('Medico', 'Paciente', 'Administrador')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "documento" character varying(10) NOT NULL, "apellidos" character varying(30) NOT NULL, "nombres" character varying(30) NOT NULL, "email" character varying(50) NOT NULL, "clave" character varying(100) NOT NULL, "estado" "public"."usuarios_estado_enum" NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL, CONSTRAINT "UQ_604e2077971f192d85cffb5c437" UNIQUE ("documento"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medicos" ("id" SERIAL NOT NULL, "id_usuario" integer NOT NULL, "matricula" character varying(10) NOT NULL, "valor_consulta" numeric(10,2) NOT NULL, CONSTRAINT "REL_0cfb85338d953c3e13eee3de76" UNIQUE ("id_usuario"), CONSTRAINT "PK_f16d578e9fd6df731d5e8551725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservas_estado_enum" AS ENUM('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "reservas" ("id" SERIAL NOT NULL, "id_medico" integer NOT NULL, "id_paciente" integer NOT NULL, "fecha_hora" TIMESTAMP NOT NULL, "estado" "public"."reservas_estado_enum" NOT NULL, "valor_consulta" numeric(10,2) NOT NULL, CONSTRAINT "PK_309c659053bcf5e56f8e40a2b42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medicos" ADD CONSTRAINT "FK_0cfb85338d953c3e13eee3de763" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_5cc3ba95151ab73eed4bd795835" FOREIGN KEY ("id_medico") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_e2047f71196d1ab97f0753b308b" FOREIGN KEY ("id_paciente") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_e2047f71196d1ab97f0753b308b"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_5cc3ba95151ab73eed4bd795835"`);
        await queryRunner.query(`ALTER TABLE "medicos" DROP CONSTRAINT "FK_0cfb85338d953c3e13eee3de763"`);
        await queryRunner.query(`DROP TABLE "reservas"`);
        await queryRunner.query(`DROP TYPE "public"."reservas_estado_enum"`);
        await queryRunner.query(`DROP TABLE "medicos"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_estado_enum"`);
    }

}
