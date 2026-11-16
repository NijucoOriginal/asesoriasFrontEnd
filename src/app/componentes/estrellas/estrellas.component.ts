import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Estrellas de calificación (1–5). Con [editable]=true permite elegir. */
@Component({
  selector: 'app-estrellas',
  standalone: true,
  template: `
    <span class="estrellas" [class.editable]="editable" [attr.aria-label]="'Calificación ' + valor + ' de 5'">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        @if (editable) {
          <button type="button" class="estrella-btn" (click)="elegir(i)" [attr.aria-label]="i + ' estrellas'">
            <i class="bi" [class.bi-star-fill]="i <= valor" [class.bi-star]="i > valor"></i>
          </button>
        } @else {
          <i class="bi"
             [class.bi-star-fill]="i <= redondeado"
             [class.bi-star-half]="i - 0.5 === redondeado"
             [class.bi-star]="i > redondeado && i - 0.5 !== redondeado"></i>
        }
      }
    </span>
  `,
  styles: [`
    .estrellas { color: #f5b301; white-space: nowrap; }
    .estrella-btn { background: none; border: none; padding: 0 2px; color: #f5b301; font-size: 1.6rem; cursor: pointer; }
  `],
})
export class EstrellasComponent {
  @Input() valor = 0;
  @Input() editable = false;
  @Output() valorChange = new EventEmitter<number>();

  get redondeado(): number {
    return Math.round((this.valor ?? 0) * 2) / 2;
  }

  elegir(i: number): void {
    this.valor = i;
    this.valorChange.emit(i);
  }
}
