import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivarCuentaService } from '../../servicios/activar-cuenta.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { AuthAsideComponent } from '../auth-aside/auth-aside.component';
import { CodigoInputComponent } from '../codigo-input/codigo-input.component';

/** Activación de cuenta con el código enviado al correo (GET /api/auth/activate/{codigo}). */
@Component({
  selector: 'app-activar',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthAsideComponent, CodigoInputComponent],
  templateUrl: './activar.component.html',
})
export class ActivarComponent implements OnInit {
  codigo = '';
  userEmail = '';
  enviando = false;
  reenviando = false;
  activada = false;
  error = '';
  /** Segundos que faltan para poder reenviar el código. */
  espera = 0;
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private service: ActivarCuentaService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    const estado = this.router.getCurrentNavigation()?.extras?.state ?? history.state;
    this.userEmail = estado?.['email'] || localStorage.getItem('pendingActivationEmail') || '';
    if (this.userEmail) localStorage.setItem('pendingActivationEmail', this.userEmail);
  }

  activar(): void {
    if (this.codigo.length !== 6 || this.enviando) {
      this.error = 'Ingresa los 6 caracteres del código.';
      return;
    }
    this.enviando = true;
    this.error = '';
    this.service.activateAccount(this.codigo).subscribe({
      next: msg => {
        this.enviando = false;
        this.activada = true;
        localStorage.removeItem('pendingActivationEmail');
        this.notificaciones.exito(msg || 'Cuenta activada exitosamente.');
        setTimeout(() => this.router.navigate(['/login']), 2200);
      },
      error: err => {
        this.enviando = false;
        this.error = mensajeError(err, 'Código incorrecto o expirado. Inténtalo de nuevo.');
      },
    });
  }

  reenviar(): void {
    const email = this.userEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error = 'Escribe un correo válido para reenviarte el código.';
      return;
    }
    this.reenviando = true;
    this.service.resendActivationCode(email).subscribe({
      next: msg => {
        this.reenviando = false;
        localStorage.setItem('pendingActivationEmail', email);
        this.notificaciones.exito(msg || 'Te enviamos un nuevo código.');
        this.iniciarEspera();
      },
      error: err => {
        this.reenviando = false;
        this.notificaciones.error(mensajeError(err, 'No se pudo reenviar el código.'));
      },
    });
  }

  private iniciarEspera(): void {
    this.espera = 60;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.espera--;
      if (this.espera <= 0) clearInterval(this.timer);
    }, 1000);
  }
}
