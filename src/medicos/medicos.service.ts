import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from '../entities/medico.entity.js';
import { CrearMedicoDto } from './dto/crear-medico.dto.js';

@Injectable()
export class MedicosService {
    constructor(
        @InjectRepository(Medico)
        private readonly medicoRepository: Repository<Medico>,
    ) { }

    async obtenerTodos() {
        return this.medicoRepository.find();
    }

    async crear(crearMedicoDto: CrearMedicoDto) {
        const medico = this.medicoRepository.create(crearMedicoDto);

        return this.medicoRepository.save(medico);
    }
}