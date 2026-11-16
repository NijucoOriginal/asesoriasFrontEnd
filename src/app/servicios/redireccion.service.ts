import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RedireccionService {
  constructor(private router: Router) {}

  /** Tras login: los usuarios activos van al inicio; los inactivos a reactivar su cuenta. */
  redirigirSegunRol(_rol?: string): void {
    this.router.navigate(['/perfil']);
  }

  redirigirALogin() { this.router.navigate(['/login']); }
  redirigirARegistro() { this.router.navigate(['/registro']); }
  redirigirAPerfil() { this.router.navigate(['/perfil']); }
  redirigirAHome() { this.router.navigate(['/']); }
  redirigirAHomeIngresado() { this.router.navigate(['/']); }
  redirigirAPoliticaDatos() { this.router.navigate(['/politicaDatos']); }
  redirigirAConocenos() { this.router.navigate(['/conocenos']); }
  redirigirAContactenos() { this.router.navigate(['/contactenos']); }
  redirigirATutores() { this.router.navigate(['/tutores']); }
  redirigirAAsesorias() { this.router.navigate(['/asesorias']); }
  redirigirAReactivar() { this.router.navigate(['/reactivar']); }
}
