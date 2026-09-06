import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity.js';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

@Column({ type: 'varchar', length: 10 })
matricula: string;

@Column({
  name: 'valor_consulta',
  type: 'numeric',
  precision: 10,
  scale: 2,
})
valorConsulta: number;
}