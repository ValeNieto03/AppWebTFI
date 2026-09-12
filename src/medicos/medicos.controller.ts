import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { MedicosService } from './medicos.service.js';
import { CrearMedicoDto } from './dto/crear-medico.dto.js';
import { ModificarValorConsultaDto } from './dto/modificar-valor-consulta.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  MedicoRespuestaDto,
  ValorConsultaActualizadoDto,
} from './dto/medico-respuesta.dto.js';

@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOkResponse({ type: [MedicoRespuestaDto] })
  obtenerMedicos() {
    return this.medicosService.obtenerTodos();
  }

  @Post()
  @ApiCreatedResponse({ type: MedicoRespuestaDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.MEDICO)
  crearMedico(@Body() crearMedicoDto: CrearMedicoDto, @Req() req: Request) {
    return this.medicosService.crear(crearMedicoDto, req.user);
  }

  @Patch(':id/valor')
  @ApiOkResponse({ type: ValorConsultaActualizadoDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
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
