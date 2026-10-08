import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_usuario: number;

  @Column()
  matricula: number;

  @Column()
  valor_consulta: number;
}