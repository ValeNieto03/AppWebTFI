import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { UsuarioRespuestaDto } from './dto/usuario-respuesta.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOkResponse({
    type: [UsuarioRespuestaDto],
  })
  obtenerUsuarios() {
    return this.usuariosService.obtenerTodos();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.MEDICO,
    RolUsuario.PACIENTE,
  )
  @ApiOkResponse({
    type: UsuarioRespuestaDto,
  })
  obtenerUsuario(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.usuariosService.obtenerPorId(
      Number(id),
      request.user,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiCreatedResponse({
    type: UsuarioRespuestaDto,
  })
  crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }
}