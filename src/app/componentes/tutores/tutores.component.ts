import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutoresService } from '../../servicios/tutores.service';
import { TutorResponse } from '../../dto/modelos';
import { mensajeError } from '../../servicios/api-error';
import { TutorCardComponent } from '../tutor-card/tutor-card.component';

type Orden = 'calificacion' | 'horas' | 'nombre';

/** Listado público de tutores con búsqueda y filtro por materia. */
@Component({
  selector: 'app-tutores',
  standalone: true,
  imports: [FormsModule, TutorCardComponent],
  templateUrl: './tutores.component.html',
})
export class TutoresComponent implements OnInit {
  tutores: TutorResponse[] = [];
  materias: string[] = [];
  cargando = true;
  error: string | null = null;

  busqueda = '';
  materia = '';
  orden: Orden = 'calificacion';

  constructor(private service: TutoresService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.service.listar().subscribe({
      next: lista => {
        this.tutores = lista;
        this.materias = [...new Set(lista.flatMap(t => t.materias))].sort((a, b) => a.localeCompare(b));
        this.cargando = false;
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudieron cargar los tutores.');
        this.cargando = false;
      },
    });
  }

  get filtrados(): TutorResponse[] {
    const q = this.normalizar(this.busqueda);
    const lista = this.tutores.filter(t => {
      const coincideMateria = !this.materia || t.materias.includes(this.materia);
      const texto = this.normalizar(`${t.nombre} ${t.apellido} ${t.carrera ?? ''} ${t.materias.join(' ')}`);
      return coincideMateria && (!q || texto.includes(q));
    });
    return lista.sort((a, b) => {
      switch (this.orden) {
        case 'horas': return b.horasTutoria - a.horasTutoria;
        case 'nombre': return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
        default: return (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0) || b.totalResenas - a.totalResenas;
      }
    });
  }

  limpiar(): void {
    this.busqueda = '';
    this.materia = '';
    this.orden = 'calificacion';
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
}
