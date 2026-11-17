import { Component, HostListener, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Idioma, IdiomaService } from '../../servicios/idioma.service';
import { ES } from '../../i18n/es';
import { PanelService } from '../../servicios/panel.service';

/** Panel flotante de accesibilidad: tamaño del texto, modo oscuro, alto contraste e idioma. */
@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './accesibilidad.component.html',
  styleUrl: './accesibilidad.component.css',
})
export class AccesibilidadComponent implements OnInit, OnDestroy {
  menuVisible = false;
  zoom = 1;
  modoOscuro = false;
  altoContraste = false;
  idiomaSeleccionado: Idioma = 'es';
  t: typeof ES;

  private subs: Subscription[] = [];

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    public idiomaService: IdiomaService,
    private panelService: PanelService
  ) {
    this.t = idiomaService.t;
  }

  ngOnInit(): void {
    this.subs.push(this.idiomaService.traducciones$.subscribe(t => (this.t = t)));
    this.subs.push(this.panelService.panel$.subscribe(panel => (this.menuVisible = panel === 'accesibilidad')));
    this.idiomaSeleccionado = this.idiomaService.idioma;

    this.modoOscuro = this.leer('modoOscuro') === 'true';
    this.altoContraste = this.leer('altoContraste') === 'true';
    const zoom = parseFloat(this.leer('zoom') ?? '');
    this.zoom = zoom >= 0.8 && zoom <= 1.5 ? zoom : 1;
    this.aplicar();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('document:keydown.escape')
  cerrar(): void {
    if (this.menuVisible) this.panelService.cerrar();
  }

  MostrarMenu(): void {
    this.panelService.abrir('accesibilidad');
  }

  CambiarModoOscuro(): void {
    if (this.modoOscuro) this.altoContraste = false;
    this.guardarYAplicar();
  }

  CambiarContraste(): void {
    if (this.altoContraste) this.modoOscuro = false;
    this.guardarYAplicar();
  }

  actualizarZoom(): void {
    this.guardarYAplicar();
  }

  cambiarZoom(delta: number): void {
    this.zoom = Math.min(1.5, Math.max(0.8, Math.round((this.zoom + delta) * 10) / 10));
    this.guardarYAplicar();
  }

  cambiarIdioma(idioma: Idioma): void {
    this.idiomaSeleccionado = idioma;
    this.idiomaService.cambiarIdioma(idioma);
  }

  restablecer(): void {
    this.zoom = 1;
    this.modoOscuro = false;
    this.altoContraste = false;
    this.guardarYAplicar();
  }

  private guardarYAplicar(): void {
    this.escribir('modoOscuro', String(this.modoOscuro));
    this.escribir('altoContraste', String(this.altoContraste));
    this.escribir('zoom', String(this.zoom));
    this.aplicar();
  }

  private aplicar(): void {
    const body = this.document.body;
    this.modoOscuro ? this.renderer.addClass(body, 'dark-mode') : this.renderer.removeClass(body, 'dark-mode');
    this.altoContraste ? this.renderer.addClass(body, 'high-contrast') : this.renderer.removeClass(body, 'high-contrast');
    if (this.zoom === 1) this.renderer.removeStyle(body, 'zoom');
    else this.renderer.setStyle(body, 'zoom', String(this.zoom));
  }

  private leer(clave: string): string | null {
    try { return localStorage.getItem(clave); } catch { return null; }
  }

  private escribir(clave: string, valor: string): void {
    try { localStorage.setItem(clave, valor); } catch { /* almacenamiento no disponible */ }
  }
}
