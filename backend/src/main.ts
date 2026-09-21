import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Este "filtro de entrada" hace que todos los DTO se validen antes de
  // que los datos lleguen a los controladores y servicios.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sistema de Clínica')
    .setDescription('API del sistema de gestión de turnos de la clínica')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        const orden = ['Auth', 'Usuarios', 'Medicos', 'Pacientes', 'Reservas'];

        return orden.indexOf(a) - orden.indexOf(b);
      },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
