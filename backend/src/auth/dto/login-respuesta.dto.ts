import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../entities/usuario.entity.js';

export class UsuarioAutenticadoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: RolUsuario })
  rol: RolUsuario;
}

export class LoginRespuestaDto {
  @ApiProperty({ example: 'Login correcto' })
  mensaje: string;

  @ApiProperty({
    description: 'Token JWT utilizado para autenticar las próximas solicitudes',
  })
  token: string;

  @ApiProperty({ type: UsuarioAutenticadoDto })
  usuario: UsuarioAutenticadoDto;
}
