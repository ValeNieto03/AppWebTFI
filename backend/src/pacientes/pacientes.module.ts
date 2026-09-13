import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity.js';
import { PacientesService } from './pacientes.service.js';
import { PacientesController } from './pacientes.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    AuthModule,
  ],
  providers: [PacientesService],
  exports: [PacientesService],
  controllers: [PacientesController],
})
export class PacientesModule {}