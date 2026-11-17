import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Confirmacion {
  titulo: string;
  mensaje: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
  icono?: string;
}

interface Pendiente extends Confirmacion {
  responder: (ok: boolean) => void;
}

/** Diálogo de confirmación de la app (lo pinta ConfirmacionComponent). */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  private _actual = new BehaviorSubject<Pendiente | null>(null);
  actual$ = this._actual.asObservable();

  /** Cierra el diálogo abierto como si se hubiera cancelado. */
  cancelarActual(): void {
    this._actual.getValue()?.responder(false);
  }

  preguntar(opciones: Confirmacion): Promise<boolean> {
    this._actual.getValue()?.responder(false);
    return new Promise(resolve => {
      this._actual.next({
        ...opciones,
        responder: ok => {
          this._actual.next(null);
          resolve(ok);
        },
      });
    });
  }
}
