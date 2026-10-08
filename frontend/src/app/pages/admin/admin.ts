import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
selector: 'app-admin',
imports: [],
templateUrl: './admin.html',
styleUrl: './admin.css',
})
export class Admin {

constructor(
private readonly authService: AuthService,
private readonly router: Router,
) {}

cerrarSesion() {
this.authService.logout();

this.router.navigate(['/login']);
}
}
