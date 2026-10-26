import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PacientesService } from './pacientes.service.js';
import { UsuarioRespuestaDto } from '../usuarios/dto/usuario-respuesta.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(
    private readonly pacientesService: PacientesService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOkResponse({
    type: [UsuarioRespuestaDto],
  })
  obtenerPacientes(): Promise<UsuarioRespuestaDto[]> {
    return this.pacientesService.obtenerTodos();
  }
}