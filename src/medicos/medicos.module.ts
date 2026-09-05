import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medico } from '../entities/medico.entity.js';
import { MedicosService } from './medicos.service.js';
import { MedicosController } from './medicos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Medico])],
  providers: [MedicosService],
  exports: [MedicosService],
  controllers: [MedicosController],
})
export class MedicosModule { }