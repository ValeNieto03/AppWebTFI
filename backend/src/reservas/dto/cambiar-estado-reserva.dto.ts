import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class CambiarEstadoReservaDto {
  @ApiProperty({
    example: 'ATENDIDO',
    description: 'Nuevo estado de la reserva',
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
  })
  @IsEnum(EstadoReserva)
  estado: EstadoReserva;
}
