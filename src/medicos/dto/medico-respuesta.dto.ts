import { ApiProperty } from '@nestjs/swagger';
import { EstadoUsuario } from '../../entities/usuario.entity.js';

export class MedicoRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  documento: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  matricula: number;

  @ApiProperty()
  valor_consulta: number;

  @ApiProperty({
    enum: EstadoUsuario,
  })
  estado: EstadoUsuario;
}