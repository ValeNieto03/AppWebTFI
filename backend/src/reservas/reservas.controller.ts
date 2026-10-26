import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Query,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ReservasService } from './reservas.service.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolUsuario } from '../entities/usuario.entity.js';

import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto.js';

import {
  ListadoReservasRespuestaDto,
  ReservaRespuestaDto,
  ListadoReservasMedicoRespuestaDto,
  ReservaEstadoRespuestaDto,
  ReservaCreadaOperacionRespuestaDto,
  ReservaCanceladaOperacionRespuestaDto,
} from './dto/reserva-respuesta.dto.js';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE)
  @ApiOkResponse({
    type: ListadoReservasRespuestaDto,
  })
  obtenerReservas(@Req() request: any): Promise<ListadoReservasRespuestaDto> {
    return this.reservasService.obtenerPorPaciente(
      request.user.id,
    );
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOkResponse({
    type: [ReservaRespuestaDto],
  })
  obtenerReservasAdmin(): Promise<ReservaRespuestaDto[]> {
    return this.reservasService.obtenerTodas();
  }

  @Get('medico')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha opcional para filtrar las reservas (AAAA-MM-DD)',
    example: '2026-10-15',
  })
  @ApiOkResponse({
    type: ListadoReservasMedicoRespuestaDto,
  })
  obtenerReservasMedico(
    @Req() request: any,
    @Query('fecha') fecha?: string,
  ): Promise<ListadoReservasMedicoRespuestaDto> {
    return this.reservasService.obtenerPorMedico(
      request.user.id,
      fecha,
    );
  }

  @Patch(':id/estado')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.MEDICO)
  @ApiOkResponse({
    type: ReservaEstadoRespuestaDto,
  })
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoReservaDto,
    @Req() request: any,
  ): Promise<ReservaEstadoRespuestaDto> {
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
  @ApiCreatedResponse({
    type: ReservaCreadaOperacionRespuestaDto,
  })
  crearReserva(
    @Body() crearReservaDto: CrearReservaDto,
    @Req() request: any,
  ): Promise<ReservaCreadaOperacionRespuestaDto> {
    return this.reservasService.crear(
      crearReservaDto,
      request.user,
    );
  }

  @Patch(':id/cancelar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.PACIENTE)
  @ApiOkResponse({
    type: ReservaCanceladaOperacionRespuestaDto,
  })
  cancelarReserva(
    @Param('id') id: string,
    @Req() request: any,
  ): Promise<ReservaCanceladaOperacionRespuestaDto> {
    return this.reservasService.cancelar(
      Number(id),
      request.user.id,
    );
  }

  @Patch('admin/:id/cancelar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  @ApiOkResponse({
    type: ReservaCanceladaOperacionRespuestaDto,
  })
  cancelarReservaAdmin(
    @Param('id') id: string,
  ): Promise<ReservaCanceladaOperacionRespuestaDto> {
    return this.reservasService.cancelarAdmin(
      Number(id),
    );
  }
}
