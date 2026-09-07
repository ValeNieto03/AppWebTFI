import { ApiProperty } from '@nestjs/swagger';

export class CrearReservaDto {
  @ApiProperty({
    example: 1,
    description: 'ID del médico',
  })
  id_medico: number;

  @ApiProperty({
    example: '10/09/2026 10:00',
    description: 'Fecha y hora de la consulta. Formato: DD/MM/AAAA HH:mm',
  })
  fecha_hora: string;
}