import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class CambiarEstadoReservaDto {
  @ApiProperty({
    example: 'Atendido',
    description: 'Nuevo estado de la reserva',
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
  })
  @IsIn(
    [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    {
      message: 'El estado debe ser Atendido o Ausente',
    },
  )
  estado: EstadoReserva;
}