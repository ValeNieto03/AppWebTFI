import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CrearMedicoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'id_usuario debe ser un número entero' })
  @IsPositive({ message: 'id_usuario debe ser un número positivo' })
  id_usuario?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'matricula debe ser un número entero' })
  @IsPositive({ message: 'matricula debe ser un número positivo' })
  matricula: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'valor_consulta debe ser un número' })
  @IsPositive({ message: 'valor_consulta debe ser un número positivo' })
  valor_consulta: number;
}