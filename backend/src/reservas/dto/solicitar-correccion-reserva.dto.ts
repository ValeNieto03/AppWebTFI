
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { EstadoReserva } from '../../entities/reserva.entity.js';

export class SolicitarCorreccionReservaDto {
  @ApiProperty({
    example: 12,
    description: 'Identificador de la reserva que se desea corregir',
  })
  @IsInt()
  @Min(1)
  id_reserva: number;

  @ApiProperty({
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    example: EstadoReserva.ATENDIDO,
    description: 'Estado correcto que solicita el médico',
  })
  @IsEnum(EstadoReserva)
  estado_solicitado: EstadoReserva;

  @ApiProperty({
    example: 'Marqué atendido por error; el paciente no asistió.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  motivo: string;
}
