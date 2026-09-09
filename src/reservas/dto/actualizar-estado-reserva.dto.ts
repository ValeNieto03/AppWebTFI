import { ApiProperty } from '@nestjs/swagger';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class ActualizarEstadoReservaDto {
  @ApiProperty({
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    example: EstadoReserva.ATENDIDO,
    description: 'Nuevo estado permitido para una reserva.',
  })
  estado: EstadoReserva.ATENDIDO | EstadoReserva.AUSENTE;
}
