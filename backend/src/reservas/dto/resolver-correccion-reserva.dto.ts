
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { EstadoSolicitudCorreccion } from '../../entities/solicitud-correccion-reserva.entity.js';

export class ResolverCorreccionReservaDto {
  @ApiProperty({
    enum: [
      EstadoSolicitudCorreccion.APROBADA,
      EstadoSolicitudCorreccion.RECHAZADA,
    ],
    example: EstadoSolicitudCorreccion.APROBADA,
  })
  @IsEnum(EstadoSolicitudCorreccion)
  estado: EstadoSolicitudCorreccion;

  @ApiProperty({
    example: 'Se verificó el registro y se autoriza la corrección.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  respuesta_admin?: string;
}
