import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, EstadoReserva } from '../entities/reserva.entity.js';
import { Medico } from '../entities/medico.entity.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { RolUsuario, Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async obtenerTodas() {
    const reservas = await this.reservaRepository.find();

    return Promise.all(
      reservas.map(async (reserva) => {
        const paciente = await this.usuarioRepository.findOneBy({
          id: reserva.id_paciente,
        });

        const medico = await this.medicoRepository.findOneBy({
          id: reserva.id_medico,
        });

        let datosMedico = null;

        if (medico) {
          const usuarioMedico = await this.usuarioRepository.findOneBy({
            id: medico.id_usuario,
          });

          datosMedico = {
            id: medico.id,
            nombre: usuarioMedico
              ? `${usuarioMedico.nombres} ${usuarioMedico.apellidos}`
              : null,
            documento: usuarioMedico?.documento ?? null,
            email: usuarioMedico?.email ?? null,
            matricula: medico.matricula,
            valor_consulta: medico.valor_consulta,
          };
        }

        return {
          id: reserva.id,
          fecha_hora: reserva.fecha_hora,
          estado: reserva.estado,
          valor_consulta: reserva.valor_consulta,

          paciente: paciente
            ? {
                id: paciente.id,
                nombre: `${paciente.nombres} ${paciente.apellidos}`,
                documento: paciente.documento,
                email: paciente.email,
              }
            : null,

          medico: datosMedico,
        };
      }),
    );
  }

  async obtenerPorPaciente(idPaciente: number) {
    const reservas = await this.reservaRepository.find({
      where: {
        id_paciente: idPaciente,
      },
    });

    if (reservas.length === 0) {
      return {
        mensaje: 'El paciente no tiene reservas',
        reservas: [],
      };
    }

    const reservasConDatos = await Promise.all(
      reservas.map(async (reserva) => {
        const paciente = await this.usuarioRepository.findOneBy({
          id: reserva.id_paciente,
        });

        const medico = await this.medicoRepository.findOneBy({
          id: reserva.id_medico,
        });

        let datosMedico = null;

        if (medico) {
          const usuarioMedico = await this.usuarioRepository.findOneBy({
            id: medico.id_usuario,
          });

          datosMedico = {
            id: medico.id,
            nombre: usuarioMedico
              ? `${usuarioMedico.nombres} ${usuarioMedico.apellidos}`
              : null,
            documento: usuarioMedico?.documento ?? null,
            email: usuarioMedico?.email ?? null,
            matricula: medico.matricula,
            valor_consulta: medico.valor_consulta,
          };
        }

        return {
          id: reserva.id,
          fecha_hora: reserva.fecha_hora,
          estado: reserva.estado,
          valor_consulta: reserva.valor_consulta,

          paciente: paciente
            ? {
                id: paciente.id,
                nombre: `${paciente.nombres} ${paciente.apellidos}`,
                documento: paciente.documento,
                email: paciente.email,
              }
            : null,

          medico: datosMedico,
        };
      }),
    );

    return {
      reservas: reservasConDatos,
    };
  }

  async obtenerPorMedico(idUsuarioMedico: number, fecha: string) {
    const medico = await this.medicoRepository.findOneBy({
      id_usuario: idUsuarioMedico,
    });

    if (!medico) {
      return {
        mensaje: 'El médico no existe',
        reservas: [],
      };
    }

    const reservas = await this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.id_medico = :idMedico', {
        idMedico: medico.id,
      })
      .andWhere('DATE(reserva.fecha_hora) = :fecha', {
        fecha,
      })
      .getMany();

    if (reservas.length === 0) {
      return {
        mensaje: 'El médico no tiene reservas para esa fecha',
        reservas: [],
      };
    }

    const reservasConPaciente = await Promise.all(
      reservas.map(async (reserva) => {
        const paciente = await this.usuarioRepository.findOneBy({
          id: reserva.id_paciente,
        });

        return {
          id: reserva.id,
          fecha_hora: reserva.fecha_hora,
          estado: reserva.estado,
          valor_consulta: reserva.valor_consulta,

          paciente: paciente
            ? {
                id: paciente.id,
                nombre: `${paciente.nombres} ${paciente.apellidos}`,
                documento: paciente.documento,
                email: paciente.email,
              }
            : null,
        };
      }),
    );

    return {
      reservas: reservasConPaciente,
    };
  }

  async cambiarEstado(
    idReserva: number,
    idUsuarioMedico: number,
    nuevoEstado: EstadoReserva,
  ) {
    const medico = await this.medicoRepository.findOneBy({
      id_usuario: idUsuarioMedico,
    });

    if (!medico) {
      return {
        mensaje: 'El médico no existe',
      };
    }

    const reserva = await this.reservaRepository.findOneBy({
      id: idReserva,
    });

    if (!reserva) {
      throw new BadRequestException('La reserva no existe');
    }

    if (reserva.id_medico !== medico.id) {
      throw new ForbiddenException(
        'No tiene permiso para modificar esta reserva',
      );
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede cambiar el estado de una reserva activa',
      );
    }

    if (
      nuevoEstado !== EstadoReserva.ATENDIDO &&
      nuevoEstado !== EstadoReserva.AUSENTE
    ) {
      throw new BadRequestException('El estado debe ser Atendido o Ausente');
    }

    reserva.estado = nuevoEstado;

    return this.reservaRepository.save(reserva);
  }

  async crear(crearReservaDto: CrearReservaDto, usuarioLogueado: any) {
    let idPaciente: number;

    if (usuarioLogueado.rol === RolUsuario.PACIENTE) {
      idPaciente = usuarioLogueado.id;
    } else if (usuarioLogueado.rol === RolUsuario.ADMINISTRADOR) {
      if (!crearReservaDto.id_paciente) {
        throw new BadRequestException(
          'El administrador debe indicar el paciente',
        );
      }

      idPaciente = crearReservaDto.id_paciente;
    } else {
      throw new ForbiddenException('No tiene permisos para crear una reserva');
    }

    const paciente = await this.usuarioRepository.findOneBy({
      id: idPaciente,
    });

    if (!paciente || paciente.rol !== RolUsuario.PACIENTE) {
      throw new BadRequestException('El usuario no es un paciente');
    }

    const partes = crearReservaDto.fecha_hora.split(' ');

    if (partes.length !== 2) {
      throw new BadRequestException(
        'La fecha debe tener el formato DD/MM/AAAA HH:mm',
      );
    }

    const [fecha, hora] = partes;
    const [dia, mes, anio] = fecha.split('/').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);

    if (!dia || !mes || !anio || Number.isNaN(horas) || Number.isNaN(minutos)) {
      throw new BadRequestException(
        'La fecha debe tener el formato DD/MM/AAAA HH:mm',
      );
    }

    if (minutos !== 0) {
      throw new BadRequestException(
        'Los turnos deben comenzar en una hora exacta, por ejemplo 08:00, 09:00 o 10:00',
      );
    }

    if (horas < 8 || horas > 15) {
      throw new BadRequestException(
        'El horario de atención es de 08:00 a 16:00',
      );
    }

    const fechaHora = new Date(anio, mes - 1, dia, horas, minutos);

    if (
      fechaHora.getFullYear() !== anio ||
      fechaHora.getMonth() !== mes - 1 ||
      fechaHora.getDate() !== dia ||
      fechaHora.getHours() !== horas ||
      fechaHora.getMinutes() !== minutos
    ) {
      throw new BadRequestException('La fecha indicada no es válida');
    }

    const ahora = new Date();

    if (fechaHora <= ahora) {
      throw new BadRequestException(
        'No se puede reservar un turno en una fecha pasada',
      );
    }

    const fechaMaxima = new Date(ahora);
    fechaMaxima.setDate(fechaMaxima.getDate() + 30);

    if (fechaHora > fechaMaxima) {
      throw new BadRequestException(
        'No se puede reservar con más de 30 días de anticipación',
      );
    }

    const medico = await this.medicoRepository.findOneBy({
      id: crearReservaDto.id_medico,
    });

    if (!medico) {
      throw new BadRequestException('El médico no existe');
    }

    const reservaExistente = await this.reservaRepository.findOne({
      where: {
        id_medico: crearReservaDto.id_medico,
        fecha_hora: fechaHora,
        estado: EstadoReserva.ACTIVO,
      },
    });

    if (reservaExistente) {
      throw new BadRequestException(
        'El médico ya tiene una reserva para ese horario',
      );
    }

    const reserva = this.reservaRepository.create({
      id_medico: crearReservaDto.id_medico,
      id_paciente: idPaciente,
      fecha_hora: fechaHora,
      estado: EstadoReserva.ACTIVO,
      valor_consulta: medico.valor_consulta,
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);

    const usuarioMedico = await this.usuarioRepository.findOneBy({
      id: medico.id_usuario,
    });

    return {
      mensaje: 'Reserva creada correctamente',
      reserva: {
        id: reservaGuardada.id,
        fecha_hora: reservaGuardada.fecha_hora,
        estado: reservaGuardada.estado,
        valor_consulta: reservaGuardada.valor_consulta,
        medico: usuarioMedico
          ? `${usuarioMedico.nombres} ${usuarioMedico.apellidos}`
          : null,
        paciente: `${paciente.nombres} ${paciente.apellidos}`,
      },
    };
  }

  async cancelar(idReserva: number, idPaciente: number) {
    const reserva = await this.reservaRepository.findOneBy({
      id: idReserva,
    });

    if (!reserva) {
      throw new BadRequestException('La reserva no existe');
    }

    if (reserva.id_paciente !== idPaciente) {
      throw new ForbiddenException(
        'No tiene permiso para cancelar esta reserva',
      );
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede cancelar una reserva activa',
      );
    }

    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);

    const diferenciaDias =
      (fechaReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);

    if (diferenciaDias < 1) {
      throw new BadRequestException(
        'La reserva solo se puede cancelar hasta el día anterior a la consulta',
      );
    }

    reserva.estado = EstadoReserva.CANCELADO;

    const reservaCancelada = await this.reservaRepository.save(reserva);

    return {
      mensaje: 'Reserva cancelada correctamente',
      reserva: {
        id: reservaCancelada.id,
        fecha_hora: reservaCancelada.fecha_hora,
        estado: reservaCancelada.estado,
        valor_consulta: reservaCancelada.valor_consulta,
      },
    };
  }

  async cancelarAdmin(idReserva: number) {
    const reserva = await this.reservaRepository.findOneBy({
      id: idReserva,
    });

    if (!reserva) {
      throw new BadRequestException('La reserva no existe');
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede cancelar una reserva activa',
      );
    }

    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);

    if (ahora >= fechaReserva) {
      throw new BadRequestException(
        'La reserva ya comenzó y no puede ser cancelada',
      );
    }

    reserva.estado = EstadoReserva.CANCELADO;

    const reservaCancelada = await this.reservaRepository.save(reserva);

    return {
      mensaje: 'Reserva cancelada correctamente',
      reserva: {
        id: reservaCancelada.id,
        fecha_hora: reservaCancelada.fecha_hora,
        estado: reservaCancelada.estado,
        valor_consulta: reservaCancelada.valor_consulta,
      },
    };
  }
}
