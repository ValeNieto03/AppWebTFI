import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
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
}
