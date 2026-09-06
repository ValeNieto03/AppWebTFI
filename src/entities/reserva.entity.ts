import {
  Column,
  Entity,
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
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_medico', type: 'int' })
  idMedico: number;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @Column({ name: 'id_paciente', type: 'int' })
  idPaciente: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ name: 'fecha_hora', type: 'timestamp' })
  fechaHora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

 @Column({
  name: 'valor_consulta',
  type: 'numeric',
  precision: 10,
  scale: 2,
})
valorConsulta: number;

}