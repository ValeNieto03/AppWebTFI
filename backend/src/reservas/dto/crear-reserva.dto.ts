import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CrearReservaDto {
  @ApiPropertyOptional({
    example: 3,
    description: 'ID del paciente. Lo utiliza el administrador al crear una reserva.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_paciente?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del médico',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_medico: number;

  @ApiProperty({
    example: '10/09/2026 10:00',
    description: 'Fecha y hora de la consulta. Formato: DD/MM/AAAA HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, {
    message: 'fecha_hora debe tener el formato DD/MM/AAAA HH:mm',
  })
  fecha_hora: string;
}
