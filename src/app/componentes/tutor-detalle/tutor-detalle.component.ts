import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TutoresService } from '../../servicios/tutores.service';
import { AsesoriasService } from '../../servicios/asesorias.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { aLocalDateTime, ahoraInputLocal } from '../../servicios/fechas';
import { MateriaTutor, ResenaResponse, TutorResponse } from '../../dto/modelos';
import { EstrellasComponent } from '../estrellas/estrellas.component';

@Component({
  selector: 'app-tutor-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, EstrellasComponent],
  templateUrl: './tutor-detalle.component.html',
  styleUrls: ['./tutor-detalle.component.css'],
})
export class TutorDetalleComponent implements OnInit {
  tutor: TutorResponse | null = null;
  resenas: ResenaResponse[] = [];
  cargando = true;
  error: string | null = null;

  // ---- Solicitud de asesoría ----
  modalAbierto = false;
  materias: MateriaTutor[] = [];
  cargandoMaterias = false;
  errorMaterias: string | null = null;
  enviando = false;
  form = {
    materiaId: null as number | null,
    temasIds: [] as number[],
    inicio: '',
    cierre: '',
    precio: null as number | null,
  };
  minFecha = ahoraInputLocal(60);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tutores: TutoresService,
    private asesorias: AsesoriasService,
    public auth: AuthService,
    private chat: ChatService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/tutores']);
      return;
    }
    this.tutores.obtener(id).subscribe({
      next: t => {
        this.tutor = t;
        this.cargando = false;
      },
      error: err => {
        this.error = err.status === 404 ? 'Este tutor no existe o no está disponible.' : mensajeError(err);
        this.cargando = false;
      },
    });
    this.tutores.resenas(id).subscribe({ next: r => (this.resenas = r), error: () => (this.resenas = []) });
  }

  get esYo(): boolean {
    return !!this.tutor && this.auth.obtenerIdUsuario() === String(this.tutor.id);
  }

  get iniciales(): string {
    return `${this.tutor?.nombre?.[0] ?? ''}${this.tutor?.apellido?.[0] ?? ''}`.toUpperCase();
  }

  get temasMateria() {
    return this.materias.find(m => m.id === this.form.materiaId)?.temas ?? [];
  }

  /** Exige sesión activa antes de interactuar con el tutor. */
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

  enviarMensaje(): void {
    if (!this.tutor || !this.requiereSesion()) return;
    this.chat.conectarWebSocket();
    this.chat.abrirConversacionCon(this.tutor.id);
  }

  abrirSolicitud(): void {
    if (!this.tutor || !this.requiereSesion()) return;
    this.modalAbierto = true;
    this.minFecha = ahoraInputLocal(60);
    if (this.materias.length) return;
    this.cargandoMaterias = true;
    this.errorMaterias = null;
    this.tutores.materias(this.tutor.id).subscribe({
      next: m => {
        this.materias = m;
        if (m.length === 1) this.form.materiaId = m[0].id;
        this.cargandoMaterias = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargandoMaterias = false;
        // Si la ruta no existe, Spring lanza NoResourceFoundException y el GlobalExceptionHandler
        // del backend la devuelve como 500 "No static resource ...".
        const noExiste =
          err.status === 404 || err.status === 405 ||
          (err.status === 500 && /no static resource|no handler/i.test(mensajeError(err, '')));
        this.errorMaterias =
          noExiste
            ?'El backend todavía no expone las materias del tutor (GET /api/tutores/{id}/materias), ' +
              'que se necesitan para enviar la solicitud. Pide al equipo de backend que agregue ese endpoint.'
            : mensajeError(err, 'No se pudieron cargar las materias del tutor.');
      },
    });
  }

  cerrarSolicitud(): void {
    if (this.enviando) return;
    this.modalAbierto = false;
  }

  onMateriaChange(): void {
    this.form.temasIds = [];
  }

  toggleTema(id: number, marcado: boolean): void {
    this.form.temasIds = marcado ? [...this.form.temasIds, id] : this.form.temasIds.filter(t => t !== id);
  }

  get errorFormulario(): string | null {
    const f = this.form;
    if (!f.materiaId) return 'Selecciona una materia.';
    if (!f.inicio || !f.cierre) return 'Indica la fecha y hora de inicio y de cierre.';
    if (new Date(f.inicio) <= new Date()) return 'La fecha de inicio no puede estar en el pasado.';
    if (new Date(f.cierre) <= new Date(f.inicio)) return 'La hora de cierre debe ser posterior a la de inicio.';
    if (!f.precio || f.precio <= 0) return 'El precio debe ser mayor que cero.';
    return null;
  }

  enviarSolicitud(): void {
    if (!this.tutor || this.errorFormulario || this.enviando) return;
    this.enviando = true;
    this.asesorias
      .crear({
        asesorId: this.tutor.id,
        materiaId: this.form.materiaId!,
        temasIds: this.form.temasIds,
        fechaInicioPropuesta: aLocalDateTime(this.form.inicio),
        fechaCierrePropuesta: aLocalDateTime(this.form.cierre),
        precio: this.form.precio!,
      })
      .subscribe({
        next: () => {
          this.enviando = false;
          this.modalAbierto = false;
          this.notificaciones.exito('¡Solicitud enviada! El tutor la revisará pronto.');
          this.router.navigate(['/asesorias']);
        },
        error: err => {
          this.enviando = false;
          this.notificaciones.error(mensajeError(err, 'No se pudo enviar la solicitud.'));
        },
      });
  }
}
