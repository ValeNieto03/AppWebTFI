import { ApiProperty } from '@nestjs/swagger';

export class MedicoValorRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  valor_consulta: number;
}

export class ModificarValorConsultaRespuestaDto {
  @ApiProperty()
  mensaje: string;

  @ApiProperty({
    type: MedicoValorRespuestaDto,
  })
  medico: MedicoValorRespuestaDto;
}
