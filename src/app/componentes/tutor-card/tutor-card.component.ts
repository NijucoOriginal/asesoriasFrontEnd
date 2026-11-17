import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TutorResponse } from '../../dto/modelos';
import { EstrellasComponent } from '../estrellas/estrellas.component';

@Component({
  selector: 'app-tutor-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, EstrellasComponent],
  template: `
    <a class="tutor-card" [routerLink]="['/tutores', tutor.id]" [attr.aria-label]="'Ver perfil de ' + nombre">
      <div class="franja"></div>
      @if (tutor.imagenPerfil) {
        <img [src]="tutor.imagenPerfil" [alt]="'Foto de ' + nombre" class="foto" loading="lazy">
      } @else {
        <span class="foto avatar-iniciales">{{ iniciales }}</span>
      }
      <div class="cuerpo">
        <h3>{{ nombre }}</h3>
        <p class="carrera">{{ tutor.carrera || 'Universidad del Quindío' }}</p>
        <div class="calificacion">
          <app-estrellas [valor]="tutor.calificacionPromedio ?? 0"></app-estrellas>
          <span>
            @if (tutor.calificacionPromedio != null) {
              <strong>{{ tutor.calificacionPromedio | number:'1.1-1' }}</strong> ({{ tutor.totalResenas }})
            } @else { Nuevo tutor }
          </span>
        </div>
        <div class="materias">
          @for (m of tutor.materias.slice(0, 3); track m) {
            <span class="chip">{{ m }}</span>
          }
          @if (tutor.materias.length > 3) {
            <span class="chip chip-gris">+{{ tutor.materias.length - 3 }}</span>
          }
        </div>
        <div class="pie">
          <span><i class="bi bi-clock"></i> {{ tutor.horasTutoria | number:'1.0-1' }} h de tutoría</span>
          <span class="ver">Ver perfil <i class="bi bi-arrow-right"></i></span>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .tutor-card { position: relative; display: flex; flex-direction: column; align-items: center; height: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); text-decoration: none; color: var(--text); overflow: hidden; transition: transform .18s, box-shadow .18s, border-color .18s; }
    .tutor-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: color-mix(in srgb, var(--primary) 45%, var(--border)); color: var(--text); }
    .franja { position: absolute; inset: 0 0 auto; height: 64px; background: linear-gradient(120deg, var(--primary-50), color-mix(in srgb, var(--primary) 18%, var(--surface))); }
    .foto { position: relative; margin-top: 22px; width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 4px solid var(--surface); box-shadow: var(--shadow-sm); font-size: 1.9rem; }
    .cuerpo { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.9rem 1.25rem 1.25rem; flex: 1; width: 100%; }
    h3 { font-size: 1.1rem; margin: 0 0 2px; }
    .carrera { color: var(--muted); font-size: .85rem; margin-bottom: .5rem; }
    .calificacion { display: flex; align-items: center; gap: 6px; font-size: .85rem; color: var(--muted); margin-bottom: .75rem; }
    .calificacion strong { color: var(--text); }
    .materias { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 1rem; }
    .pie { margin-top: auto; width: 100%; display: flex; justify-content: space-between; align-items: center; padding-top: .75rem; border-top: 1px solid var(--border); font-size: .83rem; color: var(--muted); }
    .pie i { color: var(--primary); }
    .ver { color: var(--primary-700); font-weight: 700; }
    .tutor-card:hover .ver i { transform: translateX(3px); }
    .ver i { display: inline-block; transition: transform .15s; }
  `],
})
export class TutorCardComponent {
  @Input({ required: true }) tutor!: TutorResponse;

  get nombre(): string {
    return `${this.tutor.nombre} ${this.tutor.apellido}`;
  }

  get iniciales(): string {
    return `${this.tutor.nombre?.[0] ?? ''}${this.tutor.apellido?.[0] ?? ''}`.toUpperCase();
  }
}
