import { ApiProperty } from '@nestjs/swagger';
import { EstadoUsuario, RolUsuario } from '../../entities/usuario.entity.js';

export class CrearUsuarioDto {
  @ApiProperty()
  documento: string;

  @ApiProperty()
  apellidos: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  clave: string;

  @ApiProperty({
    enum: EstadoUsuario,
  })
  estado: EstadoUsuario;

  @ApiProperty({
    enum: RolUsuario,
  })
  rol: RolUsuario;
}