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

  @Column({ type: 'varchar', length: 10, unique: true })
  documento: string;

  @Column({ type: 'varchar', length: 30 })
  apellidos: string;

  @Column({ type: 'varchar', length: 30 })
  nombres: string;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
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