import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Medico } from './medico.entity.js';
import type { Reserva } from './reserva.entity.js';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  BAJA = 'BAJA',
}

export enum RolUsuario {
  MEDICO = 'MEDICO',
  PACIENTE = 'PACIENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  documento: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
  })
  estado: EstadoUsuario;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol: RolUsuario;

  // Relaciones inversas: TypeORM conoce cómo se conectan las tres entidades.
  @OneToOne('Medico', (medico: Medico) => medico.usuario)
  medico?: Medico;

  @OneToMany('Reserva', (reserva: Reserva) => reserva.paciente)
  reservas: Reserva[];
}
