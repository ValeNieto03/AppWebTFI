import { MigrationInterface, QueryRunner } from 'typeorm';

/** Crea el modelo obligatorio del TFI con claves foráneas y protección de turnos. */
export class EsquemaClinica1789220000000 implements MigrationInterface {
  name = 'EsquemaClinica1789220000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "usuarios_estado_enum" AS ENUM ('ACTIVO', 'BAJA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "usuarios_rol_enum" AS ENUM ('MEDICO', 'PACIENTE', 'ADMINISTRADOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "reservas_estado_enum" AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO')`,
    );
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" SERIAL NOT NULL,
        "documento" TEXT NOT NULL,
        "apellidos" TEXT NOT NULL,
        "nombres" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "clave" TEXT NOT NULL,
        "estado" "usuarios_estado_enum" NOT NULL,
        "rol" "usuarios_rol_enum" NOT NULL,
        CONSTRAINT "UQ_usuarios_documento" UNIQUE ("documento"),
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "medicos" (
        "id" SERIAL NOT NULL,
        "id_usuario" INTEGER NOT NULL,
        "matricula" INTEGER NOT NULL,
        "valor_consulta" INTEGER NOT NULL,
        CONSTRAINT "UQ_medicos_usuario" UNIQUE ("id_usuario"),
        CONSTRAINT "PK_medicos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medicos_usuario" FOREIGN KEY ("id_usuario")
          REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "reservas" (
        "id" SERIAL NOT NULL,
        "id_medico" INTEGER NOT NULL,
        "id_paciente" INTEGER NOT NULL,
        "fecha_hora" TIMESTAMP NOT NULL,
        "estado" "reservas_estado_enum" NOT NULL,
        "valor_consulta" INTEGER NOT NULL,
        CONSTRAINT "PK_reservas" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reservas_medico" FOREIGN KEY ("id_medico")
          REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_reservas_paciente" FOREIGN KEY ("id_paciente")
          REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_reservas_medico_fecha_activa"
      ON "reservas" ("id_medico", "fecha_hora")
      WHERE "estado" = 'ACTIVO'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_reservas_medico_fecha_activa"`);
    await queryRunner.query(`DROP TABLE "reservas"`);
    await queryRunner.query(`DROP TABLE "medicos"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TYPE "reservas_estado_enum"`);
    await queryRunner.query(`DROP TYPE "usuarios_rol_enum"`);
    await queryRunner.query(`DROP TYPE "usuarios_estado_enum"`);
  }
}
