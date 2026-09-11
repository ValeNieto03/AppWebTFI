import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearMedicoDto {
  @ApiPropertyOptional()
  id_usuario?: number;

  @ApiProperty()
  matricula: number;

  @ApiProperty()
  valor_consulta: number;
}