import { ApiProperty } from '@nestjs/swagger';

export class CrearMedicoDto {
  @ApiProperty()
  id_usuario: number;

  @ApiProperty()
  matricula: number;

  @ApiProperty()
  valor_consulta: number;
}