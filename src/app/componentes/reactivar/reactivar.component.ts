import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../servicios/users.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';

/** Reactivación de cuentas INACTIVAS (CuentaController /api/usuarios/reactivar/*). */
@Component({
  selector: 'app-reactivar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container py-5">
      <div class="card caja mx-auto p-4">
        <div class="text-center mb-3">
          <i class="bi bi-arrow-repeat icono"></i>
          <h3 class="mt-2">Reactiva tu cuenta</h3>
          <p class="text-muted mb-0">
            Hola {{ auth.obtenerNombreUsuario() }}, tu cuenta está desactivada.
            Te enviaremos un código a <strong>{{ auth.getUserEmail() }}</strong> para reactivarla.
          </p>
        </div>

        @if (!codigoEnviado) {
          <button class="btn btn-primary w-100" (click)="solicitar()" [disabled]="enviando">
            @if (enviando) { <span class="spinner-border spinner-border-sm me-1"></span> }
            Enviarme el código
          </button>
        } @else {
          <form (ngSubmit)="confirmar()">
            <label class="form-label" for="codigo">Código de 6 dígitos</label>
            <input id="codigo" name="codigo" class="form-control text-center codigo" maxlength="6" inputmode="numeric"
                   autocomplete="one-time-code" [(ngModel)]="codigo" placeholder="••••••" required>
            <button type="submit" class="btn btn-primary w-100 mt-3" [disabled]="codigo.trim().length !== 6 || enviando">
              @if (enviando) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Reactivar cuenta
            </button>
            <button type="button" class="btn btn-link w-100 mt-1" (click)="solicitar()" [disabled]="enviando">Reenviar código</button>
          </form>
        }
        <button type="button" class="btn btn-outline-secondary rounded-pill w-100 mt-3" (click)="salir()">Cerrar sesión</button>
      </div>
    </div>
  `,
  styles: [`
    .caja { max-width: 440px; border: none; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,.1); }
    .icono { font-size: 2.6rem; color: var(--primary); }
    .codigo { font-size: 1.6rem; letter-spacing: .5rem; }
  `],
})
export class ReactivarComponent {
  codigoEnviado = false;
  codigo = '';
  enviando = false;

  constructor(
    public auth: AuthService,
    private users: UsersService,
    private chat: ChatService,
    private notificaciones: NotificacionService,
    private router: Router
  ) {
    if (!auth.estaInactivo()) this.router.navigate(['/']);
  }

  solicitar(): void {
    this.enviando = true;
    this.users.solicitarReactivacion().subscribe({
      next: r => {
        this.enviando = false;
        this.codigoEnviado = true;
        this.notificaciones.exito(r?.message ?? 'Te enviamos un código a tu correo.');
      },
      error: err => {
        this.enviando = false;
        this.notificaciones.error(mensajeError(err, 'No se pudo enviar el código.'));
      },
    });
  }

  confirmar(): void {
    this.enviando = true;
    this.users.confirmarReactivacion(this.codigo.trim()).subscribe({
      next: () => {
        this.enviando = false;
        this.notificaciones.exito('¡Tu cuenta fue reactivada!');
        this.chat.conectarWebSocket();
        this.router.navigate(['/']);
      },
      error: err => {
        this.enviando = false;
        this.notificaciones.error(mensajeError(err, 'Código inválido o expirado.'));
      },
    });
  }

  salir(): void {
    this.auth.logout();
  }
}
