import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Req,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
} from '@nestjs/swagger';

import { MedicosService } from './medicos.service.js';
import { CrearMedicoDto } from './dto/crear-medico.dto.js';
import { ModificarValorConsultaDto } from './dto/modificar-valor-consulta.dto.js';
import { MedicoRespuestaDto } from './dto/medico-respuesta.dto.js';
import { MedicoCreadoRespuestaDto } from './dto/medico-creado-respuesta.dto.js';
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
    obtenerMedicos() {
        return this.medicosService.obtenerTodos();
    }

    @Get('mi-perfil')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolUsuario.MEDICO)
    @ApiOkResponse({
        description: 'Perfil del médico autenticado',
    })
    obtenerMiPerfil(@Req() req: Request) {
        const usuario = req.user as
            | { id: number }
            | undefined;

        if (!usuario) {
            throw new UnauthorizedException(
                'Debe iniciar sesión para consultar su perfil.',
            );
        }

        return this.medicosService.obtenerPorUsuario(usuario);
    }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.MEDICO)
    @ApiCreatedResponse({
        type: MedicoCreadoRespuestaDto,
    })
    crearMedico(
        @Body() crearMedicoDto: CrearMedicoDto,
        @Req() req: Request,
    ) {
        const usuario = req.user as
            | { id: number; rol: RolUsuario }
            | undefined;

        if (!usuario) {
            throw new UnauthorizedException(
                'Debe iniciar sesión para registrarse como médico.',
            );
        }

        return this.medicosService.crear(
            crearMedicoDto,
            usuario,
        );
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
    ) {
        return this.medicosService.modificarValorConsulta(
            Number(id),
            dto.valor_consulta,
        );
    }
}