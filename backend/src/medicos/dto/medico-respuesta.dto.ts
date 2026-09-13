import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicoRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  documento?: string;

  @ApiPropertyOptional()
  nombre?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  matricula: number;

  @ApiProperty()
  valor_consulta: number;

  @ApiPropertyOptional()
  estado?: string;
}

export class ValorConsultaActualizadoDto {
  @ApiProperty({ example: 'Valor de consulta actualizado correctamente' })
  mensaje: string;

  @ApiProperty({
    example: { id: 1, valor_consulta: 25000 },
  })
  medico: {
    id: number;
    valor_consulta: number;
  };
}
