import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-medico',
  imports: [],
  templateUrl: './medico.html',
  styleUrl: './medico.css',
})
export class Medico {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  cerrarSesion() {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}