import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, EstadoReserva } from '../entities/reserva.entity.js';
import { Medico } from '../entities/medico.entity.js';
import { CrearReservaDto } from './dto/crear-reserva.dto.js';
import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

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
      return {
        mensaje: 'La reserva no existe',
      };
    }

    if (reserva.id_medico !== medico.id) {
      return {
        mensaje: 'No tiene permiso para modificar esta reserva',
      };
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      return {
        mensaje: 'Solo se puede cambiar el estado de una reserva activa',
      };
    }

    if (
      nuevoEstado !== EstadoReserva.ATENDIDO &&
      nuevoEstado !== EstadoReserva.AUSENTE
    ) {
      return {
        mensaje: 'El estado debe ser Atendido o Ausente',
      };
    }

    reserva.estado = nuevoEstado;

    return this.reservaRepository.save(reserva);
  }

  async crear(crearReservaDto: CrearReservaDto, idPaciente: number) {
    const paciente = await this.usuarioRepository.findOneBy({ id: idPaciente });

    if (!paciente || paciente.rol !== 'Paciente') {
      return { mensaje: 'El usuario no es un paciente' };
    }

    const [fecha, hora] = crearReservaDto.fecha_hora.split(' ');
    const [dia, mes, anio] = fecha.split('/');

    const fechaHora = new Date(
      Number(anio),
      Number(mes) - 1,
      Number(dia),
      ...hora.split(':').map(Number),
    );

    const medico = await this.medicoRepository.findOneBy({
      id: crearReservaDto.id_medico,
    });

    if (!medico) {
      return { mensaje: 'El médico no existe' };
    }

    const reservaExistente = await this.reservaRepository.findOne({
      where: {
        id_medico: crearReservaDto.id_medico,
        fecha_hora: fechaHora,
        estado: EstadoReserva.ACTIVO,
      },
    });

    if (reservaExistente) {
      return {
        mensaje: 'El médico ya tiene una reserva para ese horario',
      };
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
      return { mensaje: 'La reserva no existe' };
    }

    if (reserva.id_paciente !== idPaciente) {
      return {
        mensaje: 'No tiene permiso para cancelar esta reserva',
      };
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      return {
        mensaje: 'Solo se puede cancelar una reserva activa',
      };
    }

    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);

    const diferenciaDias =
      (fechaReserva.getTime() - ahora.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diferenciaDias < 1) {
      return {
        mensaje:
          'La reserva solo se puede cancelar hasta el día anterior a la consulta',
      };
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
      return { mensaje: 'La reserva no existe' };
    }

    if (reserva.estado !== EstadoReserva.ACTIVO) {
      return {
        mensaje: 'Solo se puede cancelar una reserva activa',
      };
    }

    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);

    if (ahora >= fechaReserva) {
      return {
        mensaje: 'La reserva ya comenzó y no puede ser cancelada',
      };
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