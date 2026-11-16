import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { TutoresService } from '../../servicios/tutores.service';
import { TutorResponse } from '../../dto/modelos';
import { mensajeError } from '../../servicios/api-error';
import { TutorCardComponent } from '../tutor-card/tutor-card.component';

/** Página principal (pública y con sesión). Muestra los tutores destacados reales del backend. */
@Component({
  selector: 'app-inicio-default',
  standalone: true,
  imports: [RouterLink, TutorCardComponent],
  templateUrl: './inicio-default.component.html',
  styleUrls: ['./inicio-default.component.css'],
})
export class InicioDefaultComponent implements OnInit {
  destacados: TutorResponse[] = [];
  totalTutores = 0;
  cargando = true;
  error: string | null = null;

  constructor(public auth: AuthService, private tutores: TutoresService) {}

  ngOnInit(): void {
    this.tutores.listar().subscribe({
      next: lista => {
        this.totalTutores = lista.length;
        this.destacados = [...lista]
          .sort((a, b) =>
            (b.calificacionPromedio ?? 0) - (a.calificacionPromedio ?? 0) ||
            b.totalResenas - a.totalResenas ||
            b.horasTutoria - a.horasTutoria)
          .slice(0, 6);
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
}
