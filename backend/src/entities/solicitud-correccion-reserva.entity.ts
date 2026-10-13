
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { EstadoReserva } from './reserva.entity.js';

export enum EstadoSolicitudCorreccion {
  PENDIENTE = 'Pendiente',
  APROBADA = 'Aprobada',
  RECHAZADA = 'Rechazada',
}

@Entity('solicitudes_correccion_reserva')
export class SolicitudCorreccionReserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_reserva: number;

  @Column()
  id_medico: number;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    enumName: 'estados_reservas',
  })
  estado_actual: EstadoReserva;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    enumName: 'estados_reservas',
  })
  estado_solicitado: EstadoReserva;

  @Column({ type: 'text' })
  motivo: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoSolicitudCorreccion.PENDIENTE,
  })
  estado_solicitud: EstadoSolicitudCorreccion;

  @Column({ type: 'int', nullable: true })
  id_administrador: number | null;

  @Column({ type: 'text', nullable: true })
  respuesta_admin: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_solicitud: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_resolucion: Date | null;
}
