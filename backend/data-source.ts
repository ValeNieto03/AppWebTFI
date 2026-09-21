import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Medico } from './src/entities/medico.entity.js';
import { Reserva } from './src/entities/reserva.entity.js';
import { Usuario } from './src/entities/usuario.entity.js';

config();

/** Configuración usada exclusivamente por la herramienta de migraciones. */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Usuario, Medico, Reserva],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
