import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ActualizarEstadoReservaDto } from './dto/actualizar-estado-reserva.dto.js';
import {
  EstadoReserva,
  Reserva,
} from '../entities/reserva.entity.js';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  async obtenerTurnosDelMedicoPorFecha(
    idMedico: number,
    fecha: string,
  ): Promise<Reserva[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      throw new BadRequestException(
        'La fecha debe tener el formato YYYY-MM-DD',
      );
    }

    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59.999`);

    if (Number.isNaN(inicio.getTime())) {
      throw new BadRequestException('La fecha no es válida');
    }

    return this.reservasRepository.find({
      where: {
        idMedico,
        fechaHora: Between(inicio, fin),
        estado: EstadoReserva.ACTIVO,
      },
      order: {
        fechaHora: 'ASC',
      },
    });
  }

  async actualizarEstado(
    id: number,
    actualizarEstadoDto: ActualizarEstadoReservaDto,
  ): Promise<Reserva> {
    const estadosPermitidos = [
      EstadoReserva.ATENDIDO,
      EstadoReserva.AUSENTE,
    ];

    if (!estadosPermitidos.includes(actualizarEstadoDto.estado)) {
      throw new BadRequestException(
        'El estado debe ser ATENDIDO o AUSENTE',
      );
    }

    const reserva = await this.reservasRepository.findOneBy({ id });

    if (!reserva) {
      throw new NotFoundException('La reserva no existe');
    }

    reserva.estado = actualizarEstadoDto.estado;
    return this.reservasRepository.save(reserva);
  }
}
