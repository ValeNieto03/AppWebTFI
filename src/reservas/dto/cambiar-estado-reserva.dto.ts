import { IsEnum } from 'class-validator';
import { EstadoReserva } from '../../entities/reserva.entity.js';

export class CambiarEstadoReservaDto {
  @IsEnum(EstadoReserva)
  estado: EstadoReserva;
}