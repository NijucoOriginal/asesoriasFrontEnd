import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Página 404 para rutas que no existen. */
@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5 aparecer">
      <div class="tarjeta vacio mx-auto" style="max-width: 560px">
        <div class="codigo">404</div>
        <h1 class="h3">Esta página no existe</h1>
        <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <div class="d-flex gap-2 justify-content-center flex-wrap">
          <a routerLink="/" class="btn btn-primary">Ir al inicio</a>
          <a routerLink="/tutores" class="btn btn-outline-primary">Ver tutores</a>
        </div>
      </div>
    </div>
  `,
  styles: [`.codigo { font-size: 4.5rem; font-weight: 800; color: var(--primary); line-height: 1; margin-bottom: .5rem; }`],
})
export class NoEncontradoComponent {}
