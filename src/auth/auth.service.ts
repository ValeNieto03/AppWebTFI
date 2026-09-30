import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos',
      );
    }

    const claveCorrecta = await bcrypt.compare(
      loginDto.clave,
      usuario.clave,
    );

    if (!claveCorrecta) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos',
      );
    }

    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException(
        'El usuario no está activo',
      );
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      mensaje: 'Login correcto',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombres,
        apellido: usuario.apellidos,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}