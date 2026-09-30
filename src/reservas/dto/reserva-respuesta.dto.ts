import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class PersonaReservaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiPropertyOptional()
  documento?: string;

  @ApiPropertyOptional()
  email?: string;
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

  @ApiProperty({
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;

  @ApiPropertyOptional({
    type: PersonaReservaDto,
    nullable: true,
  })
  paciente?: PersonaReservaDto | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  medico: string | null;
}

export class ListadoReservasRespuestaDto {
  @ApiPropertyOptional()
  mensaje?: string;

  @ApiProperty({
    type: [ReservaRespuestaDto],
  })
  reservas: ReservaRespuestaDto[];
}

export class ReservaMedicoRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fecha_hora: Date;

  @ApiProperty({
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;

  @ApiPropertyOptional({
    type: PersonaReservaDto,
    nullable: true,
  })
  paciente?: PersonaReservaDto | null;
}

export class ListadoReservasMedicoRespuestaDto {
  @ApiPropertyOptional()
  mensaje?: string;

  @ApiProperty({
    type: [ReservaMedicoRespuestaDto],
  })
  reservas: ReservaMedicoRespuestaDto[];
}

export class ReservaEstadoRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  id_medico: number;

  @ApiProperty()
  id_paciente: number;

  @ApiProperty()
  fecha_hora: Date;

  @ApiProperty({
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;
}

export class ReservaCreadaRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fecha_hora: Date;

  @ApiProperty({
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  medico: string | null;

  @ApiProperty()
  paciente: string;
}

export class ReservaCreadaOperacionRespuestaDto {
  @ApiProperty()
  mensaje: string;

  @ApiProperty({
    type: ReservaCreadaRespuestaDto,
  })
  reserva: ReservaCreadaRespuestaDto;
}

export class ReservaCanceladaRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fecha_hora: Date;

  @ApiProperty({
    enum: EstadoReserva,
  })
  estado: EstadoReserva;

  @ApiProperty()
  valor_consulta: number;
}

export class ReservaCanceladaOperacionRespuestaDto {
  @ApiProperty()
  mensaje: string;

  @ApiProperty({
    type: ReservaCanceladaRespuestaDto,
  })
  reserva: ReservaCanceladaRespuestaDto;
}