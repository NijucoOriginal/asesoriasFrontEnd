import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NotificacionService } from '../../servicios/notificacion.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of (notificaciones.toasts$ | async) ?? []; track t.id) {
        <div class="toast-item" [class]="'toast-item toast-' + t.tipo" role="status">
          <i class="bi"
             [class.bi-check-circle]="t.tipo === 'success'"
             [class.bi-exclamation-triangle]="t.tipo === 'error'"
             [class.bi-info-circle]="t.tipo === 'info'"></i>
          <span>{{ t.mensaje }}</span>
          <button type="button" class="btn-close btn-close-sm" aria-label="Cerrar" (click)="notificaciones.cerrar(t.id)"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts { position: fixed; top: 16px; right: 16px; z-index: 2000; display: flex; flex-direction: column; gap: 10px; max-width: min(380px, calc(100vw - 32px)); }
    .toast-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; box-shadow: 0 6px 18px rgba(0,0,0,.15); background: #fff; border-left: 5px solid; font-size: .95rem; }
    .toast-item span { flex: 1; }
    .toast-success { border-color: #10bb82; } .toast-success i { color: #10bb82; }
    .toast-error { border-color: #e53935; } .toast-error i { color: #e53935; }
    .toast-info { border-color: #1e88e5; } .toast-info i { color: #1e88e5; }
    .btn-close-sm { font-size: .7rem; }
  `],
})
export class ToastsComponent {
  constructor(public notificaciones: NotificacionService) {}
}
