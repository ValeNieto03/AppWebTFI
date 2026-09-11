import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
//import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
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
  crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto);
  }
}