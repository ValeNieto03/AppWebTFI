import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Reserva } from '../entities/reserva.entity.js';
import { Medico } from '../entities/medico.entity.js';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { Usuario } from '../entities/usuario.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Medico, Usuario]),
    AuthModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}