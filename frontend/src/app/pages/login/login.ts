import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  clave = '';

  mensaje = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  iniciarSesion() {
    if (this.cargando) {
      return;
    }

    this.mensaje = '';

    if (!this.email || !this.clave) {
      this.mensaje =
        'Completá el correo electrónico y la contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.login(this.email, this.clave).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso:', respuesta);

        this.cargando = false;

        if (
          respuesta.mensaje === 'Login correcto' &&
          respuesta.usuario
        ) {
          if (respuesta.usuario.rol === 'Administrador') {
            this.router.navigate(['/admin']);
            return;
          }

          if (respuesta.usuario.rol === 'Paciente') {
            this.router.navigate(['/paciente']);
            return;
          }

          if (respuesta.usuario.rol === 'Medico') {
            this.router.navigate(['/medico']);
            return;
          }

          this.mensaje =
            `Bienvenido/a ${respuesta.usuario.nombre} ${respuesta.usuario.apellido}`;

          this.email = '';
          this.clave = '';
        } else {
          this.mensaje = respuesta.mensaje;
        }
      },

      error: (error) => {
        console.error(
          'Error al iniciar sesión:',
          error,
        );

        this.cargando = false;

        if (error.status === 0) {
          this.mensaje =
            'No se pudo conectar con el servidor.';
        } else if (error.error?.message) {
          this.mensaje = error.error.message;
        } else {
          this.mensaje =
            'Ocurrió un error al iniciar sesión.';
        }
      },
    });
  }
}