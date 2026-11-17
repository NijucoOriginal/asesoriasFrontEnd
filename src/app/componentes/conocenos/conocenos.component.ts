import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { IdiomaService } from '../../servicios/idioma.service';
import { TutoresService } from '../../servicios/tutores.service';
import { MateriasService } from '../../servicios/materias.service';
import { ProgramasService } from '../../servicios/programas.service';
import { ES } from '../../i18n/es';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './conocenos.component.html',
  styleUrl: './conocenos.component.css',
})
export class ConocenosComponent implements OnInit, OnDestroy {
  t: typeof ES;
  /** Cifras reales de la plataforma (null mientras cargan o si el backend no responde). */
  cifras: { tutores: number; materias: number; carreras: number } | null = null;
  private sub!: Subscription;

  constructor(
    public idiomaService: IdiomaService,
    private tutores: TutoresService,
    private materias: MateriasService,
    private programas: ProgramasService
  ) {
    this.t = idiomaService.t;
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => (this.t = t));
    forkJoin({
      tutores: this.tutores.listar().pipe(catchError(() => of(null))),
      materias: this.materias.catalogo().pipe(catchError(() => of(null))),
      carreras: this.programas.catalogo().pipe(catchError(() => of(null))),
    }).subscribe(r => {
      if (r.tutores && r.materias && r.carreras) {
        this.cifras = { tutores: r.tutores.length, materias: r.materias.length, carreras: r.carreras.length };
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
