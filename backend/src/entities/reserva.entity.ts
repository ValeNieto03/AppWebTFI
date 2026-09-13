import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medico } from './medico.entity.js';
import { Usuario } from './usuario.entity.js';

export enum EstadoReserva {
  ACTIVO = 'ACTIVO',
  ATENDIDO = 'ATENDIDO',
  AUSENTE = 'AUSENTE',
  CANCELADO = 'CANCELADO',
}

@Entity('reservas')
@Index('UQ_reservas_medico_fecha_activa', ['id_medico', 'fecha_hora'], {
  unique: true,
  where: '"estado" = \'ACTIVO\'',
})
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_medico', type: 'int' })
  id_medico: number;

  @ManyToOne(() => Medico, (medico) => medico.reservas, { nullable: false })
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @Column({ name: 'id_paciente', type: 'int' })
  id_paciente: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.reservas, { nullable: false })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @Column({ type: 'int' })
  valor_consulta: number;
}
