import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
selector: 'app-paciente',
imports: [],
templateUrl: './paciente.html',
styleUrl: './paciente.css',
})
export class Paciente {

constructor(
private readonly authService: AuthService,
private readonly router: Router,
) {}

cerrarSesion() {
this.authService.logout();

this.router.navigate(['/login']);

}
}
