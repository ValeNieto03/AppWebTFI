import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolUsuario, Usuario } from '../entities/usuario.entity.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async obtenerTodos() {
    return this.usuarioRepository.find({
      select: {
        id: true,
        documento: true,
        apellidos: true,
        nombres: true,
        email: true,
        estado: true,
        rol: true,
      },
    });
  }

  async obtenerPorId(id: number, usuario: any) {
    if (usuario.rol !== RolUsuario.ADMINISTRADOR && usuario.id !== id) {
      throw new ForbiddenException(
        'No tiene permisos para consultar este usuario.',
      );
    }

    return this.usuarioRepository.findOne({
      select: {
        id: true,
        documento: true,
        apellidos: true,
        nombres: true,
        email: true,
        estado: true,
        rol: true,
      },
      where: { id },
    });
  }

  async buscarPorEmail(email: string) {
    return this.usuarioRepository.findOneBy({ email });
  }

  async crear(crearUsuarioDto: CrearUsuarioDto) {
    const claveHasheada = await bcrypt.hash(crearUsuarioDto.clave, 10);

    const usuario = this.usuarioRepository.create({
      ...crearUsuarioDto,
      clave: claveHasheada,
    });

    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    return {
      id: usuarioGuardado.id,
      documento: usuarioGuardado.documento,
      apellidos: usuarioGuardado.apellidos,
      nombres: usuarioGuardado.nombres,
      email: usuarioGuardado.email,
      estado: usuarioGuardado.estado,
      rol: usuarioGuardado.rol,
    };
  }
}
