import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medico } from '../entities/medico.entity.js';
import { MedicosService } from './medicos.service.js';
import { MedicosController } from './medicos.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medico]),
    AuthModule,
  ],
  providers: [MedicosService],
  exports: [MedicosService],
  controllers: [MedicosController],
})
export class MedicosModule {}