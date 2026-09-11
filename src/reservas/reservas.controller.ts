import { Body, Controller, Get, Post, Req, Query, Patch, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReservasService } from './reservas.service.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';
import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto.js';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) { }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE)
  obtenerReservas(@Req() request: any) {
    return this.reservasService.obtenerPorPaciente(request.user.id);
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  obtenerReservasAdmin() {
    return this.reservasService.obtenerTodas();
  }

  @Get('medico')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  obtenerReservasMedico(
    @Req() request: any,
    @Query('fecha') fecha: string,
  ) {
    return this.reservasService.obtenerPorMedico(
      request.user.id,
      fecha,
    );
  }

  @Patch(':id/estado')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoReservaDto,
    @Req() request: any,
  ) {
    return this.reservasService.cambiarEstado(
      Number(id),
      request.user.id,
      dto.estado,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  crearReserva(
    @Body() crearReservaDto: CrearReservaDto,
    @Req() request: any,
  ) {
    return this.reservasService.crear(
      crearReservaDto,
      request.user,
    );
  }

  @Patch(':id/cancelar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE)
  cancelarReserva(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.reservasService.cancelar(
      Number(id),
      request.user.id,
    );
  }

  @Patch('admin/:id/cancelar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  cancelarReservaAdmin(@Param('id') id: string) {
    return this.reservasService.cancelarAdmin(Number(id));
  }
}