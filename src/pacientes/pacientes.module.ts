import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity.js';
import { PacientesService } from './pacientes.service.js';
import { PacientesController } from './pacientes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [PacientesService],
  exports: [PacientesService],
  controllers: [PacientesController],
})
export class PacientesModule {}