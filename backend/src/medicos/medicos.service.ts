import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medico } from '../entities/medico.entity.js';

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