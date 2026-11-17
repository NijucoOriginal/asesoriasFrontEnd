import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../servicios/users.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { AuthAsideComponent } from '../auth-aside/auth-aside.component';
import { CodigoInputComponent } from '../codigo-input/codigo-input.component';

/** Reactivación de cuentas INACTIVAS (CuentaController /api/usuarios/reactivar/*). */
@Component({
  selector: 'app-reactivar',
  standalone: true,
  imports: [AuthAsideComponent, CodigoInputComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card aparecer">
        <app-auth-aside titulo="Te extrañamos" texto="Reactiva tu cuenta para volver a pedir y ofrecer asesorías."></app-auth-aside>
        <div class="auth-body">
          <div class="auth-icono"><i class="bi bi-arrow-repeat"></i></div>
          <h1>Reactiva tu cuenta</h1>
          <p class="subtitulo">
            Hola {{ auth.obtenerNombreUsuario() }}, tu cuenta está desactivada.
            @if (!codigoEnviado) {
              Te enviaremos un código a <strong>{{ auth.getUserEmail() }}</strong> para reactivarla.
            } @else {
              Escribe el código que enviamos a <strong>{{ auth.getUserEmail() }}</strong>.
            }
          </p>

          @if (!codigoEnviado) {
            <button class="btn btn-primary w-100 py-2" (click)="solicitar()" [disabled]="enviando">
              @if (enviando) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Enviarme el código
            </button>
          } @else {
            <app-codigo-input [codigo]="codigo" (codigoChange)="codigo = $event" (completo)="confirmar()" [deshabilitado]="enviando"></app-codigo-input>
            <button class="btn btn-primary w-100 py-2" (click)="confirmar()" [disabled]="codigo.length !== 6 || enviando">
              @if (enviando) { <span class="spinner-border spinner-border-sm me-2"></span> }
              Reactivar cuenta
            </button>
            <button type="button" class="btn btn-ghost w-100 mt-2" (click)="solicitar()" [disabled]="enviando">Reenviar código</button>
          }
          <div class="auth-separador">o</div>
          <button type="button" class="btn btn-outline-secondary w-100" (click)="salir()">
            <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
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
    if (this.codigo.length !== 6 || this.enviando) return;
    this.enviando = true;
    this.users.confirmarReactivacion(this.codigo).subscribe({
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
