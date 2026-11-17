import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { TutoresService } from '../../servicios/tutores.service';
import { TutorResponse } from '../../dto/modelos';
import { mensajeError } from '../../servicios/api-error';
import { TutorCardComponent } from '../tutor-card/tutor-card.component';

/** Página principal (pública y con sesión). Muestra datos reales del backend. */
@Component({
  selector: 'app-inicio-default',
  standalone: true,
  imports: [RouterLink, FormsModule, TutorCardComponent],
  templateUrl: './inicio-default.component.html',
  styleUrls: ['./inicio-default.component.css'],
})
export class InicioDefaultComponent implements OnInit {
  destacados: TutorResponse[] = [];
  materiasPopulares: string[] = [];
  totalTutores = 0;
  cargando = true;
  error: string | null = null;
  consulta = '';

  constructor(public auth: AuthService, private tutores: TutoresService, private router: Router) {}

  ngOnInit(): void {
    this.tutores.listar().subscribe({
      next: lista => {
        this.totalTutores = lista.length;
        this.destacados = [...lista]
          .sort(
            (a, b) =>
              (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0) ||
              b.totalResenas - a.totalResenas ||
              b.horasTutoria - a.horasTutoria
          )
          .slice(0, 6);
        // Materias con más tutores
        const conteo = new Map<string, number>();
        lista.flatMap(t => t.materias).forEach(m => conteo.set(m, (conteo.get(m) ?? 0) + 1));
        this.materiasPopulares = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m]) => m);
        this.cargando = false;
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudieron cargar los tutores.');
        this.cargando = false;
      },
    });
  }

  get nombre(): string {
    return this.auth.obtenerNombreUsuario() ?? '';
  }

  buscar(): void {
    const q = this.consulta.trim();
    this.router.navigate(['/tutores'], q ? { queryParams: { q } } : {});
  }
}
