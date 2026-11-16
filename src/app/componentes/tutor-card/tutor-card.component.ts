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
    <a class="card tutor-card h-100 text-decoration-none" [routerLink]="['/tutores', tutor.id]">
      <div class="text-center pt-4">
        @if (tutor.imagenPerfil) {
          <img [src]="tutor.imagenPerfil" [alt]="'Foto de ' + nombre" class="rounded-circle tutor-foto" width="110" height="110">
        } @else {
          <div class="tutor-foto tutor-iniciales mx-auto">{{ iniciales }}</div>
        }
      </div>
      <div class="card-body text-center d-flex flex-column">
        <h5 class="card-title mb-1">{{ nombre }}</h5>
        <p class="text-muted small mb-2">{{ tutor.carrera || 'Universidad del Quindío' }}</p>
        <div class="mb-2">
          <app-estrellas [valor]="tutor.calificacionPromedio ?? 0"></app-estrellas>
          <span class="small text-muted ms-1">
            @if (tutor.calificacionPromedio != null) {
              {{ tutor.calificacionPromedio | number:'1.1-1' }} ({{ tutor.totalResenas }})
            } @else { Sin reseñas }
          </span>
        </div>
        <div class="mb-3">
          @for (m of tutor.materias.slice(0, 4); track m) {
            <span class="badge rounded-pill tutor-materia me-1 mb-1">{{ m }}</span>
          }
          @if (tutor.materias.length > 4) {
            <span class="badge rounded-pill text-bg-light mb-1">+{{ tutor.materias.length - 4 }}</span>
          }
        </div>
        <p class="fw-semibold mt-auto mb-0 text-dark small">
          <i class="bi bi-clock"></i> {{ tutor.horasTutoria | number:'1.0-1' }} horas de tutoría
        </p>
      </div>
    </a>
  `,
  styles: [`
    .tutor-card { border: none; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,.08); transition: transform .2s, box-shadow .2s; color: inherit; }
    .tutor-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.12); }
    .tutor-foto { object-fit: cover; border: 4px solid var(--primary-light); }
    .tutor-iniciales { width: 110px; height: 110px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 700; }
    .tutor-materia { background: var(--primary-light); color: #0b7a55; font-weight: 500; white-space: normal; }
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
