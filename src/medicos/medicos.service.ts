import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medico } from '../entities/medico.entity.js';
import { CrearMedicoDto } from './dto/crear-medico.dto.js';
import { RolUsuario } from '../entities/usuario.entity.js';

@Injectable()
export class MedicosService {
    constructor(
        @InjectRepository(Medico)
        private readonly medicoRepository: Repository<Medico>,
    ) { }

    async obtenerTodos() {
        return this.medicoRepository
            .createQueryBuilder('medico')
            .innerJoin('usuarios', 'usuario', 'usuario.id = medico.id_usuario')
            .select([
                'medico.id AS id',
                'usuario.documento AS documento',
                "CONCAT(usuario.nombres, ' ', usuario.apellidos) AS nombre",
                'usuario.email AS email',
                'medico.matricula AS matricula',
                'medico.valor_consulta AS valor_consulta',
                'usuario.estado AS estado',
            ])
            .getRawMany();
    }

    async crear(crearMedicoDto: CrearMedicoDto, usuario: any) {
        let idUsuario: number;

        // Si es administrador, utiliza el id_usuario enviado.
        if (usuario.rol === RolUsuario.ADMINISTRADOR) {
            if (!crearMedicoDto.id_usuario) {
                throw new BadRequestException(
                    'El administrador debe indicar el usuario médico.',
                );
            }

            idUsuario = crearMedicoDto.id_usuario;
        }

        // Si es médico, utiliza automáticamente su propio usuario.
        else if (usuario.rol === RolUsuario.MEDICO) {
            idUsuario = usuario.id;
        }

        else {
            throw new ForbiddenException(
                'No tiene permisos para registrarse como médico.',
            );
        }

        // Verificamos que no esté registrado previamente.
        const medicoExistente = await this.medicoRepository.findOne({
            where: {
                id_usuario: idUsuario,
            },
        });

        if (medicoExistente) {
            throw new BadRequestException(
                'Este usuario ya está registrado como médico.',
            );
        }

        const medico = this.medicoRepository.create({
            id_usuario: idUsuario,
            matricula: crearMedicoDto.matricula,
            valor_consulta: crearMedicoDto.valor_consulta,
        });

        return this.medicoRepository.save(medico);
    }

    async modificarValorConsulta(
        idMedico: number,
        nuevoValor: number,
    ) {
        if (!nuevoValor || nuevoValor <= 0) {
            throw new BadRequestException(
                'El valor de la consulta debe ser mayor a 0.',
            );
        }

        const medico = await this.medicoRepository.findOneBy({
            id: idMedico,
        });

        if (!medico) {
            throw new BadRequestException(
                'El médico no existe.',
            );
        }

        medico.valor_consulta = nuevoValor;

        const medicoActualizado =
            await this.medicoRepository.save(medico);

        return {
            mensaje: 'Valor de consulta actualizado correctamente',
            medico: {
                id: medicoActualizado.id,
                valor_consulta: medicoActualizado.valor_consulta,
            },
        };
    }
}