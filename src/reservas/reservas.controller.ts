import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ActualizarEstadoReservaDto } from './dto/actualizar-estado-reserva.dto.js';
import { ReservasService } from './reservas.service.js';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('medico/:idMedico')
  obtenerTurnosDelMedico(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @Query('fecha') fecha: string,
  ) {
    return this.reservasService.obtenerTurnosDelMedicoPorFecha(
      idMedico,
      fecha,
    );
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarEstadoDto: ActualizarEstadoReservaDto,
  ) {
    return this.reservasService.actualizarEstado(id, actualizarEstadoDto);
  }
}
