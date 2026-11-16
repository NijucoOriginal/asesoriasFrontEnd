import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  tipo: 'success' | 'error' | 'info';
  mensaje: string;
}

/** Avisos flotantes (toasts) de toda la app. Los pinta ToastsComponent. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private seq = 0;
  private _toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts.asObservable();

  exito(mensaje: string): void { this.mostrar('success', mensaje); }
  error(mensaje: string): void { this.mostrar('error', mensaje); }
  info(mensaje: string): void { this.mostrar('info', mensaje); }

  cerrar(id: number): void {
    this._toasts.next(this._toasts.getValue().filter(t => t.id !== id));
  }

  private mostrar(tipo: Toast['tipo'], mensaje: string): void {
    const toast: Toast = { id: ++this.seq, tipo, mensaje };
    this._toasts.next([...this._toasts.getValue(), toast]);
    setTimeout(() => this.cerrar(toast.id), 4500);
  }
}
