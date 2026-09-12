import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class CrearMedicoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_usuario?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  matricula: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  valor_consulta: number;
}
