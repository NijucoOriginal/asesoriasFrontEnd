import { Component, HostListener } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ConfirmacionService } from '../../servicios/confirmacion.service';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (servicio.actual$ | async; as c) {
      <div class="modal-fondo" (click)="c.responder(false)">
        <div class="modal-caja caja-confirmacion text-center" role="alertdialog" aria-modal="true"
             [attr.aria-label]="c.titulo" (click)="$event.stopPropagation()">
          <div class="icono" [class.peligro]="c.peligro">
            <i class="bi" [class]="'bi ' + (c.icono ?? (c.peligro ? 'bi-exclamation-triangle' : 'bi-question-circle'))"></i>
          </div>
          <h4 class="mb-2">{{ c.titulo }}</h4>
          <p class="text-muted mb-4">{{ c.mensaje }}</p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button type="button" class="btn btn-outline-secondary px-4" (click)="c.responder(false)">{{ c.cancelar ?? 'Cancelar' }}</button>
            <button type="button" class="btn px-4" [class.btn-danger]="c.peligro" [class.btn-primary]="!c.peligro"
                    (click)="c.responder(true)" autofocus>{{ c.confirmar ?? 'Confirmar' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .caja-confirmacion { max-width: 420px; }
    .icono { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: var(--primary-50); color: var(--primary); }
    .icono.peligro { background: var(--danger-50); color: var(--danger); }
  `],
})
export class ConfirmacionComponent {
  constructor(public servicio: ConfirmacionService) {}

  @HostListener('document:keydown.escape')
  cerrar(): void {
    this.servicio.cancelarActual();
  }
}
