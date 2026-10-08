import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../entities/usuario.entity.js';

export class UsuarioLoginRespuestaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    enum: RolUsuario,
  })
  rol: RolUsuario;
}

export class LoginRespuestaDto {
  @ApiProperty({
    example: 'Login correcto',
  })
  mensaje: string;

  @ApiProperty()
  token: string;

  @ApiProperty({
    type: UsuarioLoginRespuestaDto,
  })
  usuario: UsuarioLoginRespuestaDto;
}