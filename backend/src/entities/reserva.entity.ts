import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  id_medico: number;

  @Column()
  id_paciente: number;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @Column()
  valor_consulta: number;
}