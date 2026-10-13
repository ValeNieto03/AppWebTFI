
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
    Usuario,
    RolUsuario,
} from '../entities/usuario.entity.js';

import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) { }

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
        if (
            usuario.rol !== RolUsuario.ADMINISTRADOR &&
            usuario.id !== id
        ) {
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
        const usuarioPorDocumento =
            await this.usuarioRepository.findOneBy({
                documento: crearUsuarioDto.documento,
            });

        if (usuarioPorDocumento) {
            throw new BadRequestException(
                'El documento ya está registrado.',
            );
        }

        const usuarioPorEmail =
            await this.usuarioRepository.findOneBy({
                email: crearUsuarioDto.email,
            });

        if (usuarioPorEmail) {
            throw new BadRequestException(
                'El email ya está registrado.',
            );
        }

        const claveHasheada = await bcrypt.hash(
            crearUsuarioDto.clave,
            10,
        );

        const usuario = this.usuarioRepository.create({
            ...crearUsuarioDto,
            clave: claveHasheada,
        });

        try {
            const usuarioGuardado =
                await this.usuarioRepository.save(usuario);

            return {
                id: usuarioGuardado.id,
                documento: usuarioGuardado.documento,
                apellidos: usuarioGuardado.apellidos,
                nombres: usuarioGuardado.nombres,
                email: usuarioGuardado.email,
                estado: usuarioGuardado.estado,
                rol: usuarioGuardado.rol,
            };
        } catch (error: any) {
            if (error?.code === '23505') {
                if (
                    error?.constraint === 'usuarios_documento_key'
                ) {
                    throw new BadRequestException(
                        'El documento ya está registrado.',
                    );
                }

                if (
                    error?.constraint === 'usuarios_email_key'
                ) {
                    throw new BadRequestException(
                        'El email ya está registrado.',
                    );
                }

                throw new BadRequestException(
                    'Ya existe un usuario con alguno de los datos indicados.',
                );
            }

            throw error;
        }
    }

    async actualizar(
        id: number,
        datos: ActualizarUsuarioDto,
    ) {
        const usuario = await this.usuarioRepository.findOneBy({ id });

        if (!usuario) {
            throw new NotFoundException(
                'No se encontró el usuario que querés modificar.',
            );
        }

        if (
            datos.documento !== undefined &&
            datos.documento !== usuario.documento
        ) {
            const documentoExistente =
                await this.usuarioRepository.findOneBy({
                    documento: datos.documento,
                });

            if (
                documentoExistente &&
                documentoExistente.id !== id
            ) {
                throw new BadRequestException(
                    'El documento ya está registrado por otro usuario.',
                );
            }
        }

        if (
            datos.email !== undefined &&
            datos.email !== usuario.email
        ) {
            const emailExistente =
                await this.usuarioRepository.findOneBy({
                    email: datos.email,
                });

            if (
                emailExistente &&
                emailExistente.id !== id
            ) {
                throw new BadRequestException(
                    'El correo electrónico ya está registrado por otro usuario.',
                );
            }
        }

        if (
            datos.documento !== undefined &&
            !datos.documento.trim()
        ) {
            throw new BadRequestException(
                'El documento no puede estar vacío.',
            );
        }

        if (
            datos.nombres !== undefined &&
            !datos.nombres.trim()
        ) {
            throw new BadRequestException(
                'Los nombres no pueden estar vacíos.',
            );
        }

        if (
            datos.apellidos !== undefined &&
            !datos.apellidos.trim()
        ) {
            throw new BadRequestException(
                'Los apellidos no pueden estar vacíos.',
            );
        }

        if (
            datos.email !== undefined &&
            !datos.email.trim()
        ) {
            throw new BadRequestException(
                'El correo electrónico no puede estar vacío.',
            );
        }

        if (datos.documento !== undefined) {
            usuario.documento = datos.documento.trim();
        }

        if (datos.nombres !== undefined) {
            usuario.nombres = datos.nombres.trim();
        }

        if (datos.apellidos !== undefined) {
            usuario.apellidos = datos.apellidos.trim();
        }

        if (datos.email !== undefined) {
            usuario.email = datos.email.trim();
        }

        if (datos.estado !== undefined) {
            usuario.estado = datos.estado;
        }

        try {
            const usuarioActualizado =
                await this.usuarioRepository.save(usuario);

            return {
                id: usuarioActualizado.id,
                documento: usuarioActualizado.documento,
                apellidos: usuarioActualizado.apellidos,
                nombres: usuarioActualizado.nombres,
                email: usuarioActualizado.email,
                estado: usuarioActualizado.estado,
                rol: usuarioActualizado.rol,
            };
        } catch (error: any) {
            if (error?.code === '23505') {
                throw new BadRequestException(
                    'El documento o el correo electrónico ya está registrado.',
                );
            }

            throw error;
        }
    }
}
