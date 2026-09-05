import {Body, Controller, Get, Post} from '@nestjs/common';
import { MedicosService } from './medicos.service.js';
import { CrearMedicoDto } from './dto/crear-medico.dto.js';

@Controller('medicos')
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) { }

    @Get()
    obtenerMedicos() {
        return this.medicosService.obtenerTodos();
    }

    @Post()
    crearMedico(@Body() crearMedicoDto: CrearMedicoDto) {
        return this.medicosService.crear(crearMedicoDto);
    }
}