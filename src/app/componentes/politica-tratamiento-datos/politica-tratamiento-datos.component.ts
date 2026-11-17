import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdiomaService } from '../../servicios/idioma.service';
import { ES } from '../../i18n/es';

@Component({
  selector: 'app-politica-tratamiento-datos',
  standalone: true,
  templateUrl: './politica-tratamiento-datos.component.html',
  styleUrl: './politica-tratamiento-datos.component.css',
})
export class PoliticaTratamientoDatosComponent implements OnInit, OnDestroy {
  t: typeof ES;
  private sub!: Subscription;

  constructor(private router: Router, public idiomaService: IdiomaService) {
    this.t = idiomaService.t;
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => (this.t = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get secciones(): { id: string; titulo: string; texto: string }[] {
    const p = this.t.politicaDatos;
    const tt = p.titulos;
    return [
      { id: 'introduccion', titulo: tt.introduccion, texto: p.introduccion },
      { id: 'alcance', titulo: tt.alcance, texto: p.alcance },
      { id: 'definiciones', titulo: tt.definiciones, texto: '' },
      { id: 'principios', titulo: tt.principios, texto: p.principios },
      { id: 'finalidades', titulo: tt.finalidades, texto: p.finalidades },
      { id: 'derechos', titulo: tt.derechos, texto: p.derechos },
      { id: 'procedimiento', titulo: tt.procedimiento, texto: p.procedimiento },
      { id: 'seguridad', titulo: tt.seguridad, texto: p.seguridad },
      { id: 'transferencia', titulo: tt.transferencia, texto: p.transferencia },
      { id: 'vigencia', titulo: tt.vigencia, texto: p.vigencia },
    ];
  }

  ir(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Si vino desde el registro, vuelve al registro; si no, al inicio. */
  redirigirAlInicioMetodo(): void {
    if (localStorage.getItem('migaPan') === 'registro') {
      localStorage.removeItem('migaPan');
      this.router.navigate(['/registro']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
