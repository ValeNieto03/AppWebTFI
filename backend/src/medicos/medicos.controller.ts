import {
    Body,
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
} from '@nestjs/swagger';

import { MedicosService } from './medicos.service.js';
import { ModificarValorConsultaDto } from './dto/modificar-valor-consulta.dto.js';
import { MedicoRespuestaDto } from './dto/medico-respuesta.dto.js';
import { ModificarValorConsultaRespuestaDto } from './dto/medico-valor-respuesta.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';

@Controller('medicos')
export class MedicosController {
    constructor(
        private readonly medicosService: MedicosService,
    ) { }

    @Get()
    @ApiOkResponse({
        type: [MedicoRespuestaDto],
    })
    obtenerMedicos(): Promise<MedicoRespuestaDto[]> {
        return this.medicosService.obtenerTodos();
    }

    @Patch(':id/valor')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMINISTRADOR)
    @ApiOkResponse({
        type: ModificarValorConsultaRespuestaDto,
    })
    modificarValorConsulta(
        @Param('id') id: string,
        @Body() dto: ModificarValorConsultaDto,
    ): Promise<ModificarValorConsultaRespuestaDto> {
        return this.medicosService.modificarValorConsulta(
            Number(id),
            dto.valor_consulta,
        );
    }
}