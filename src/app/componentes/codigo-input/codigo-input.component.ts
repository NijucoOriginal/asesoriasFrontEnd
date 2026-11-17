import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

/**
 * Seis casillas para códigos de verificación (activación, recuperación, reactivación).
 * Acepta letras y números, avanza solo, retrocede con Backspace y permite pegar el código completo.
 */
@Component({
  selector: 'app-codigo-input',
  standalone: true,
  template: `
    <div class="codigo-inputs" role="group" aria-label="Código de verificación">
      @for (i of indices; track i) {
        <input #casilla type="text" inputmode="text" maxlength="1" autocomplete="one-time-code"
               [attr.aria-label]="'Dígito ' + (i + 1)" [value]="valores[i]" [disabled]="deshabilitado"
               (input)="onInput($event, i)" (keydown)="onKeyDown($event, i)" (paste)="onPaste($event)"
               (focus)="$any($event.target).select()">
      }
    </div>
  `,
})
export class CodigoInputComponent {
  @Input() longitud = 6;
  @Input() deshabilitado = false;
  @Output() codigoChange = new EventEmitter<string>();
  @Output() completo = new EventEmitter<string>();
  @ViewChildren('casilla') casillas!: QueryList<ElementRef<HTMLInputElement>>;

  valores: string[] = Array(6).fill('');

  get indices(): number[] {
    return Array.from({ length: this.longitud }, (_, i) => i);
  }

  @Input() set codigo(v: string) {
    const limpio = (v ?? '').slice(0, this.longitud);
    this.valores = Array.from({ length: this.longitud }, (_, i) => limpio[i] ?? '');
  }

  limpiar(): void {
    this.valores = Array(this.longitud).fill('');
    this.emitir();
    setTimeout(() => this.enfocar(0));
  }

  onInput(event: Event, i: number): void {
    const input = event.target as HTMLInputElement;
    const ch = input.value.replace(/[^a-zA-Z0-9]/g, '').slice(-1);
    this.valores[i] = ch;
    input.value = ch;
    this.emitir();
    if (ch && i < this.longitud - 1) this.enfocar(i + 1);
  }

  onKeyDown(event: KeyboardEvent, i: number): void {
    if (event.key === 'Backspace' && !this.valores[i] && i > 0) {
      this.valores[i - 1] = '';
      this.emitir();
      this.enfocar(i - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && i > 0) {
      this.enfocar(i - 1);
    } else if (event.key === 'ArrowRight' && i < this.longitud - 1) {
      this.enfocar(i + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const texto = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(0, this.longitud);
    if (!texto) return;
    event.preventDefault();
    this.codigo = texto;
    this.emitir();
    this.enfocar(Math.min(texto.length, this.longitud - 1));
  }

  private emitir(): void {
    const codigo = this.valores.join('');
    this.codigoChange.emit(codigo);
    if (codigo.length === this.longitud) this.completo.emit(codigo);
  }

  private enfocar(i: number): void {
    this.casillas?.get(i)?.nativeElement.focus();
  }
}
