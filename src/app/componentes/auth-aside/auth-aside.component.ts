import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Panel verde de marca que acompaña a las páginas de cuenta (login, registro, activar...). */
@Component({
  selector: 'app-auth-aside',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'auth-aside' },
  template: `
    <a routerLink="/" class="auth-marca">EDÉN<small>Asesorías</small></a>
    <div class="auth-aside-extra">
      <h2 class="h3 mt-4 mb-2">{{ titulo }}</h2>
      <p class="mb-0">{{ texto }}</p>
      <ul>
        <li><i class="bi bi-search"></i><span>Encuentra tutores de tu misma universidad, por materia.</span></li>
        <li><i class="bi bi-calendar-check"></i><span>Propón horario y precio; el tutor acepta o contrapropone.</span></li>
        <li><i class="bi bi-chat-dots"></i><span>Chatea directamente y califica cada asesoría.</span></li>
      </ul>
    </div>
    <p class="small mb-0 auth-aside-extra" style="opacity:.75">Universidad del Quindío · Armenia</p>
  `,
})
export class AuthAsideComponent {
  @Input() titulo = 'Aprender acompañado es aprender mejor';
  @Input() texto = 'La red de asesorías entre estudiantes de la Universidad del Quindío.';
}
