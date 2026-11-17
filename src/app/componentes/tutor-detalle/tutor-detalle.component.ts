import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TutoresService } from '../../servicios/tutores.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { MateriaTutor, ResenaResponse, TutorResponse } from '../../dto/modelos';
import { EstrellasComponent } from '../estrellas/estrellas.component';

/** Perfil público de un tutor: materias (con temas), estadísticas y reseñas. */
@Component({
  selector: 'app-tutor-detalle',
  standalone: true,
  imports: [RouterLink, DecimalPipe, EstrellasComponent],
  templateUrl: './tutor-detalle.component.html',
  styleUrls: ['./tutor-detalle.component.css'],
})
export class TutorDetalleComponent implements OnInit {
  tutor: TutorResponse | null = null;
  materias: MateriaTutor[] = [];
  resenas: ResenaResponse[] = [];
  cargando = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutores: TutoresService,
    public auth: AuthService,
    private chat: ChatService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.cargar(Number(params.get('id'))));
  }

  private cargar(id: number): void {
    if (!id) {
      this.router.navigate(['/tutores']);
      return;
    }
    this.cargando = true;
    this.error = null;
    this.tutores.obtener(id).subscribe({
      next: t => {
        this.tutor = t;
        this.cargando = false;
      },
      error: err => {
        this.error = err.status === 404 ? 'Este tutor no existe o ya no está disponible.' : mensajeError(err, 'No se pudo cargar el tutor.');
        this.cargando = false;
      },
    });
    this.tutores.materias(id).subscribe({ next: m => (this.materias = m), error: () => (this.materias = []) });
    this.tutores.resenas(id).subscribe({ next: r => (this.resenas = r), error: () => (this.resenas = []) });
  }

  get esYo(): boolean {
    return !!this.tutor && this.auth.obtenerIdUsuario() === String(this.tutor.id);
  }

  get iniciales(): string {
    return `${this.tutor?.nombre?.[0] ?? ''}${this.tutor?.apellido?.[0] ?? ''}`.toUpperCase();
  }

  /** Cuántas reseñas tiene cada calificación (5 → 1) para las barras. */
  get distribucion(): { estrellas: number; cantidad: number; porcentaje: number }[] {
    const total = this.resenas.length || 1;
    return [5, 4, 3, 2, 1].map(e => {
      const cantidad = this.resenas.filter(r => r.calificacion === e).length;
      return { estrellas: e, cantidad, porcentaje: Math.round((cantidad / total) * 100) };
    });
  }

  /** Materias a mostrar: con temas si el backend los entrega, si no solo los nombres del TutorResponse. */
  get listaMaterias(): { nombre: string; temas: string[] }[] {
    if (this.materias.length) return this.materias.map(m => ({ nombre: m.nombre, temas: m.temas.map(t => t.nombre) }));
    return (this.tutor?.materias ?? []).map(nombre => ({ nombre, temas: [] }));
  }

  /** Exige sesión con cuenta activa antes de interactuar con el tutor. */
  private requiereSesion(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.notificaciones.info('Inicia sesión para continuar.');
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
      return false;
    }
    if (this.auth.estaInactivo()) {
      this.router.navigate(['/reactivar']);
      return false;
    }
    return true;
  }

  solicitar(): void {
    if (!this.tutor || !this.requiereSesion()) return;
    this.router.navigate(['/asesorias/nueva', this.tutor.id]);
  }

  enviarMensaje(): void {
    if (!this.tutor || !this.requiereSesion()) return;
    this.chat.conectarWebSocket();
    this.chat.abrirConversacionCon(this.tutor.id);
  }
}
