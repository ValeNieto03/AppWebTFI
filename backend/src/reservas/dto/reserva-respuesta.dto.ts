import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class PersonaReservaDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  nombre: string | null;

  @ApiPropertyOptional({ nullable: true })
  documento?: string | null;

  @ApiPropertyOptional({ nullable: true })
  email?: string | null;
}

export class MedicoReservaDto extends PersonaReservaDto {
  @ApiProperty()
  matricula: number;

  @ApiProperty()
  valor_consulta: number;
}

export class ReservaRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fecha_hora: Date;

  @ApiProperty({ enum: EstadoReserva })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;

  @ApiPropertyOptional({ type: PersonaReservaDto, nullable: true })
  paciente?: PersonaReservaDto | null;

  @ApiPropertyOptional({ type: MedicoReservaDto, nullable: true })
  medico?: MedicoReservaDto | null;
}

export class ListadoReservasRespuestaDto {
  @ApiPropertyOptional()
  mensaje?: string;

  @ApiProperty({ type: [ReservaRespuestaDto] })
  reservas: ReservaRespuestaDto[];
}

export class OperacionReservaRespuestaDto {
  @ApiProperty()
  mensaje: string;

  @ApiProperty({ type: ReservaRespuestaDto })
  reserva: ReservaRespuestaDto;
}
