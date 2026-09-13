import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  beforeEach(async () => {
    const constructor = Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          // El controlador se prueba aislado; el servicio no debe acceder a la base.
          provide: UsuariosService,
          useValue: {
            obtenerTodos: vi.fn(),
            obtenerPorId: vi.fn(),
            crear: vi.fn(),
            login: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true });

    const module: TestingModule = await constructor.compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
