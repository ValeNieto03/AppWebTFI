import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

    async obtenerTodos() {
        return this.usuarioRepository.find();
    }

    async obtenerPorId(id: number) {
        return this.usuarioRepository.findOneBy({ id });
    }

    async buscarPorEmail(email: string) {
        return this.usuarioRepository.findOneBy({ email });
    }

    async login(loginDto: LoginDto) {
        const usuario = await this.buscarPorEmail(loginDto.email);

        if (!usuario) {
            return {
                mensaje: 'Usuario o contraseña incorrectos',
            };
        }

        const claveCorrecta = await bcrypt.compare(
            loginDto.clave,
            usuario.clave,
        );

        if (!claveCorrecta) {
            return {
                mensaje: 'Usuario o contraseña incorrectos',
            };
        }

        if (usuario.estado !== 'activo') {
            return {
                mensaje: 'El usuario no está activo',
            };
        }

        return {
            mensaje: 'Login correcto',
            id: usuario.id,
            nombre: usuario.nombres,
            apellido: usuario.apellidos,
            email: usuario.email,
            rol: usuario.rol,
        };
    }

    async crear(crearUsuarioDto: CrearUsuarioDto) {
        const claveHasheada = await bcrypt.hash(crearUsuarioDto.clave, 10);

        const usuario = this.usuarioRepository.create({
            ...crearUsuarioDto,
            clave: claveHasheada,
        });

        return this.usuarioRepository.save(usuario);
    }
}