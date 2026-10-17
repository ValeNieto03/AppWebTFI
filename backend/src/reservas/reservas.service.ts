
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Reserva,
  EstadoReserva,
} from '../entities/reserva.entity.js';

import { Medico } from '../entities/medico.entity.js';
import {
  Usuario,
  RolUsuario,
} from '../entities/usuario.entity.js';

import {
  SolicitudCorreccionReserva,
  EstadoSolicitudCorreccion,
} from '../entities/solicitud-correccion-reserva.entity.js';

import { CrearReservaDto } from './dto/crear-reserva.dto.js';

import {
  SolicitarCorreccionReservaDto,
} from './dto/solicitar-correccion-reserva.dto.js';

import {
  ResolverCorreccionReservaDto,
} from './dto/resolver-correccion-reserva.dto.js';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,

    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(SolicitudCorreccionReserva)
    private readonly solicitudRepository: Repository<SolicitudCorreccionReserva>,
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

  async obtenerPorMedico(
    idUsuarioMedico: number,
    fecha?: string,
  ) {
    const medico = await this.medicoRepository.findOneBy({
      id_usuario: idUsuarioMedico,
    });

    if (!medico) {
      return {
        mensaje: 'El médico no existe',
        reservas: [],
      };
    }

    const consulta = this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.id_medico = :idMedico', {
        idMedico: medico.id,
      });

    if (fecha) {
      consulta.andWhere(
        'DATE(reserva.fecha_hora) = :fecha',
        { fecha },
      );
    }

    consulta.orderBy('reserva.fecha_hora', 'ASC');

    const reservas = await consulta.getMany();

    if (reservas.length === 0) {
      return {
        mensaje: fecha
          ? 'El médico no tiene reservas para esa fecha'
          : 'El médico no tiene reservas',
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
      throw new BadRequestException('El médico no existe');
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
      throw new BadRequestException(
        'El estado debe ser Atendido o Ausente',
      );
    }

    reserva.estado = nuevoEstado;

    return this.reservaRepository.save(reserva);
  }

  async solicitarCorreccion(
    idUsuarioMedico: number,
    dto: SolicitarCorreccionReservaDto,
  ) {
    const medico = await this.medicoRepository.findOneBy({
      id_usuario: idUsuarioMedico,
    });

    if (!medico) {
      throw new BadRequestException('El médico no existe');
    }

    const reserva = await this.reservaRepository.findOneBy({
      id: dto.id_reserva,
    });

    if (!reserva) {
      throw new BadRequestException('La reserva no existe');
    }

    if (reserva.id_medico !== medico.id) {
      throw new ForbiddenException(
        'No tiene permiso para solicitar cambios en esta reserva',
      );
    }

    if (
      reserva.estado !== EstadoReserva.ATENDIDO &&
      reserva.estado !== EstadoReserva.AUSENTE
    ) {
      throw new BadRequestException(
        'Solo se pueden corregir reservas marcadas como Atendido o Ausente',
      );
    }

    if (
      dto.estado_solicitado !== EstadoReserva.ATENDIDO &&
      dto.estado_solicitado !== EstadoReserva.AUSENTE
    ) {
      throw new BadRequestException(
        'El estado solicitado debe ser Atendido o Ausente',
      );
    }

    if (dto.estado_solicitado === reserva.estado) {
      throw new BadRequestException(
        'El estado solicitado debe ser diferente al estado actual',
      );
    }

    if (!dto.motivo?.trim()) {
      throw new BadRequestException(
        'Debe indicar el motivo de la corrección',
      );
    }

    const solicitudPendiente =
      await this.solicitudRepository.findOneBy({
        id_reserva: reserva.id,
        estado_solicitud: EstadoSolicitudCorreccion.PENDIENTE,
      });

    if (solicitudPendiente) {
      throw new BadRequestException(
        'Esta reserva ya tiene una solicitud de corrección pendiente',
      );
    }

    const solicitud = this.solicitudRepository.create({
      id_reserva: reserva.id,
      id_medico: medico.id,
      estado_actual: reserva.estado,
      estado_solicitado: dto.estado_solicitado,
      motivo: dto.motivo.trim(),
      estado_solicitud: EstadoSolicitudCorreccion.PENDIENTE,
    });

    const solicitudGuardada =
      await this.solicitudRepository.save(solicitud);

    return {
      mensaje: 'Solicitud de corrección enviada al administrador',
      solicitud: solicitudGuardada,
    };
  }

  async obtenerSolicitudesCorreccion() {
    const solicitudes = await this.solicitudRepository.find({
      order: {
        fecha_solicitud: 'DESC',
      },
    });

    return Promise.all(
      solicitudes.map(async (solicitud) => {
        const reserva = await this.reservaRepository.findOneBy({
          id: solicitud.id_reserva,
        });

        const medico = await this.medicoRepository.findOneBy({
          id: solicitud.id_medico,
        });

        const usuarioMedico = medico
          ? await this.usuarioRepository.findOneBy({
            id: medico.id_usuario,
          })
          : null;

        const paciente = reserva
          ? await this.usuarioRepository.findOneBy({
            id: reserva.id_paciente,
          })
          : null;

        return {
          ...solicitud,
          medico: usuarioMedico
            ? {
              id: medico!.id,
              nombre: `${usuarioMedico.nombres} ${usuarioMedico.apellidos}`,
              email: usuarioMedico.email,
            }
            : null,
          paciente: paciente
            ? {
              id: paciente.id,
              nombre: `${paciente.nombres} ${paciente.apellidos}`,
              email: paciente.email,
            }
            : null,
          fecha_reserva: reserva?.fecha_hora ?? null,
          estado_reserva_actual: reserva?.estado ?? null,
        };
      }),
    );
  }

  async resolverSolicitudCorreccion(
    idSolicitud: number,
    idUsuarioAdministrador: number,
    dto: ResolverCorreccionReservaDto,
  ) {
    const solicitud = await this.solicitudRepository.findOneBy({
      id: idSolicitud,
    });

    if (!solicitud) {
      throw new BadRequestException(
        'La solicitud de corrección no existe',
      );
    }

    if (
      solicitud.estado_solicitud !==
      EstadoSolicitudCorreccion.PENDIENTE
    ) {
      throw new BadRequestException(
        'Esta solicitud ya fue resuelta',
      );
    }

    if (
      dto.estado !== EstadoSolicitudCorreccion.APROBADA &&
      dto.estado !== EstadoSolicitudCorreccion.RECHAZADA
    ) {
      throw new BadRequestException(
        'La resolución debe ser Aprobada o Rechazada',
      );
    }

    if (dto.estado === EstadoSolicitudCorreccion.APROBADA) {
      const reserva = await this.reservaRepository.findOneBy({
        id: solicitud.id_reserva,
      });

      if (!reserva) {
        throw new BadRequestException(
          'La reserva asociada ya no existe',
        );
      }

      if (reserva.estado !== solicitud.estado_actual) {
        throw new BadRequestException(
          'La reserva cambió de estado desde que se envió la solicitud. No se puede aprobar la corrección.',
        );
      }

      reserva.estado = solicitud.estado_solicitado;

      await this.reservaRepository.save(reserva);
    }

    solicitud.estado_solicitud = dto.estado;
    solicitud.id_administrador = idUsuarioAdministrador;
    solicitud.respuesta_admin =
      dto.respuesta_admin?.trim() || null;
    solicitud.fecha_resolucion = new Date();

    const solicitudResuelta =
      await this.solicitudRepository.save(solicitud);

    return {
      mensaje:
        dto.estado === EstadoSolicitudCorreccion.APROBADA
          ? 'Solicitud aprobada y reserva corregida'
          : 'Solicitud rechazada',
      solicitud: solicitudResuelta,
    };
  }

  async crear(
    crearReservaDto: CrearReservaDto,
    usuarioLogueado: any,
  ) {
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
      throw new ForbiddenException(
        'No tiene permisos para crear una reserva',
      );
    }

    const paciente = await this.usuarioRepository.findOneBy({
      id: idPaciente,
    });

    if (!paciente || paciente.rol !== RolUsuario.PACIENTE) {
      throw new BadRequestException(
        'El usuario no es un paciente',
      );
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

    if (
      !dia ||
      !mes ||
      !anio ||
      Number.isNaN(horas) ||
      Number.isNaN(minutos)
    ) {
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

    const fechaHora = new Date(
      anio,
      mes - 1,
      dia,
      horas,
      minutos,
    );

    if (
      fechaHora.getFullYear() !== anio ||
      fechaHora.getMonth() !== mes - 1 ||
      fechaHora.getDate() !== dia ||
      fechaHora.getHours() !== horas ||
      fechaHora.getMinutes() !== minutos
    ) {
      throw new BadRequestException(
        'La fecha indicada no es válida',
      );
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

    const reservaGuardada =
      await this.reservaRepository.save(reserva);

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

  async cancelar(
    idReserva: number,
    idPaciente: number,
  ) {
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

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diaConsulta = new Date(reserva.fecha_hora);
    diaConsulta.setHours(0, 0, 0, 0);

    if (hoy >= diaConsulta) {
      throw new BadRequestException(
        'La reserva solo se puede cancelar hasta el día anterior a la consulta',
      );
    }

    reserva.estado = EstadoReserva.CANCELADO;

    const reservaCancelada =
      await this.reservaRepository.save(reserva);

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

    const reservaCancelada =
      await this.reservaRepository.save(reserva);

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
