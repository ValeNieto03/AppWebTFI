import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class ModificarValorConsultaDto {
  @ApiProperty({
    example: 25000,
    description: 'Nuevo valor de la consulta',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  valor_consulta: number;
}
