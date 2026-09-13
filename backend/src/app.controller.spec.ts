import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('definición', () => {
    it('debe crear el controlador principal', () => {
      // El controlador ya no expone getHello(); comprobamos su responsabilidad actual.
      expect(appController).toBeDefined();
    });
  });
});
