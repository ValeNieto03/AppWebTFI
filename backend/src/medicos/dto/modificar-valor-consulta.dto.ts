import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class ModificarValorConsultaDto {
  @ApiProperty({
    example: 25000,
    description: 'Nuevo valor de la consulta',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'valor_consulta debe ser un número' })
  @IsPositive({ message: 'valor_consulta debe ser un número positivo' })
  valor_consulta: number;
}