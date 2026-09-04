import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoUsuario {
  ACTIVO = 'activo',
  BAJA = 'baja',
}

export enum RolUsuario {
  MEDICO = 'Medico',
  PACIENTE = 'Paciente',
  ADMINISTRADOR = 'Administrador',
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
}