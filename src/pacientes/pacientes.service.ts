import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from '../entities/usuario.entity.js';

@Injectable()
export class PacientesService {
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
            where: {
                rol: RolUsuario.PACIENTE,
            },
        });
    }

    async obtenerPorId(id: number) {
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
            where: {
                id,
                rol: RolUsuario.PACIENTE,
            },
        });
    }
}