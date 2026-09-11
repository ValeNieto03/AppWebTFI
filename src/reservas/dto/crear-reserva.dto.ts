import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearReservaDto {
  @ApiPropertyOptional({
    example: 3,
    description: 'ID del paciente. Lo utiliza el administrador al crear una reserva.',
  })
  id_paciente?: number;

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