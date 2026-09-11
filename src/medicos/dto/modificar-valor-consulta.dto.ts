import { ApiProperty } from '@nestjs/swagger';

export class ModificarValorConsultaDto {
  @ApiProperty({
    example: 25000,
    description: 'Nuevo valor de la consulta',
  })
  valor_consulta: number;
}