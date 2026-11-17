import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError, Observable } from 'rxjs';
import { AsesoriasService } from '../../servicios/asesorias.service';
import { TutoresService } from '../../servicios/tutores.service';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { ConfirmacionService } from '../../servicios/confirmacion.service';
import { aInputLocal, aLocalDateTime, ahoraInputLocal, parseLocal } from '../../servicios/fechas';
import {
  AsesoriaResponse,
  ESTADO_ASESORIA_LABEL,
  EstadoAsesoria,
  MotivoContrapropuesta,
  ResenaResponse,
} from '../../dto/modelos';
import { EstrellasComponent } from '../estrellas/estrellas.component';

type Vista = 'todas' | 'estudiante' | 'tutor';
type Filtro = 'activas' | 'historial' | 'todas';

const ACTIVAS: EstadoAsesoria[] = ['PENDIENTE', 'CONTRAPROPUESTA', 'ACEPTADA'];
/** AsesoriaService.HORAS_LIMITE_CANCELACION en el backend. */
const HORAS_LIMITE_CANCELACION = 12;

@Component({
  selector: 'app-asesorias',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, CurrencyPipe, EstrellasComponent],
  templateUrl: './asesorias.component.html',
  styleUrls: ['./asesorias.component.css'],
})
export class AsesoriasComponent implements OnInit {
  asesorias: AsesoriaResponse[] = [];
  /** Reseñas existentes de mis asesorías finalizadas, por asesoriaId. */
  resenas = new Map<number, ResenaResponse>();
  cargando = true;
  error: string | null = null;
  procesando: number | null = null;

  vista: Vista = 'todas';
  filtro: Filtro = 'activas';
  readonly etiquetas = ESTADO_ASESORIA_LABEL;
  private get yo(): number {
    return Number(this.auth.obtenerIdUsuario());
  }

  // ---- Modal de propuesta ----
  propuesta: AsesoriaResponse | null = null;
  formPropuesta = { inicio: '', cierre: '', precio: null as number | null, motivo: null as MotivoContrapropuesta | null };
  minFecha = ahoraInputLocal(30);

  // ---- Modal de reseña ----
  resenaDe: AsesoriaResponse | null = null;
  formResena = { calificacion: 0, descripcion: '' };

  constructor(
    private service: AsesoriasService,
    private tutores: TutoresService,
    private auth: AuthService,
    private chat: ChatService,
    private notificaciones: NotificacionService,
    private confirmacion: ConfirmacionService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.service.listar().subscribe({
      next: lista => {
        this.asesorias = lista;
        this.cargando = false;
        this.cargarResenas();
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudieron cargar tus asesorías.');
        this.cargando = false;
      },
    });
  }

  /** El backend no tiene "GET reseña de una asesoría": se buscan en las reseñas públicas de cada tutor. */
  private cargarResenas(): void {
    const tutoresIds = [
      ...new Set(
        this.asesorias.filter(a => a.estado === 'FINALIZADA' && this.soyEstudiante(a)).map(a => a.asesor.id)
      ),
    ];
    if (!tutoresIds.length) return;
    forkJoin(tutoresIds.map(id => this.tutores.resenas(id).pipe(catchError(() => of([] as ResenaResponse[]))))).subscribe(
      listas => {
        this.resenas = new Map(listas.flat().map(r => [r.asesoriaId, r]));
      }
    );
  }

  // ---------------- Vista ----------------

  get visibles(): AsesoriaResponse[] {
    return this.asesorias.filter(a => {
      const porRol =
        this.vista === 'todas' || (this.vista === 'tutor' ? this.soyTutor(a) : this.soyEstudiante(a));
      const activa = ACTIVAS.includes(a.estado);
      const porEstado = this.filtro === 'todas' || (this.filtro === 'activas' ? activa : !activa);
      return porRol && porEstado;
    });
  }

  contar(vista: Vista): number {
    return this.asesorias.filter(a => vista === 'todas' || (vista === 'tutor' ? this.soyTutor(a) : this.soyEstudiante(a)))
      .length;
  }

  get pendientesDeMi(): number {
    return this.asesorias.filter(a => this.puedoResponder(a)).length;
  }

  soyTutor(a: AsesoriaResponse): boolean { return a.asesor.id === this.yo; }
  soyEstudiante(a: AsesoriaResponse): boolean { return a.participante.id === this.yo; }

  contraparte(a: AsesoriaResponse) {
    return this.soyTutor(a) ? a.participante : a.asesor;
  }

  inicio(a: AsesoriaResponse): string { return a.fechaInicioConfirmada ?? a.fechaInicioPropuesta; }
  cierre(a: AsesoriaResponse): string { return a.fechaCierreConfirmada ?? a.fechaCierrePropuesta; }

  // ---------------- Reglas (espejo de AsesoriaService) ----------------

  /** PENDIENTE la responde el tutor; CONTRAPROPUESTA la responde el estudiante. */
  puedoResponder(a: AsesoriaResponse): boolean {
    return (a.estado === 'PENDIENTE' && this.soyTutor(a)) || (a.estado === 'CONTRAPROPUESTA' && this.soyEstudiante(a));
  }

  puedoCancelar(a: AsesoriaResponse): boolean {
    if (a.estado === 'PENDIENTE') return this.soyEstudiante(a);
    return a.estado === 'ACEPTADA';
  }

  /** En ACEPTADA solo se cancela hasta 12 h antes del inicio. */
  fueraDeVentana(a: AsesoriaResponse): boolean {
    if (a.estado !== 'ACEPTADA') return false;
    const ini = parseLocal(a.fechaInicioConfirmada);
    return !!ini && Date.now() > ini.getTime() - HORAS_LIMITE_CANCELACION * 3600000;
  }

  puedoResenar(a: AsesoriaResponse): boolean {
    return a.estado === 'FINALIZADA' && this.soyEstudiante(a);
  }

  descripcionEstado(a: AsesoriaResponse): string {
    const otro = this.contraparte(a).nombre;
    switch (a.estado) {
      case 'PENDIENTE':
        return this.soyTutor(a) ? `${otro} te envió una solicitud. Responde aceptando, rechazando o contraproponiendo.`
          : `Esperando la respuesta de ${otro}.`;
      case 'CONTRAPROPUESTA': {
        const motivo = a.motivoContrapropuesta === 'PRECIO' ? 'el precio' : 'el horario';
        return this.soyEstudiante(a) ? `${otro} propuso un cambio en ${motivo}. Acepta, rechaza o envía otra propuesta.`
          : `Enviaste una contrapropuesta (${motivo}). Esperando a ${otro}.`;
      }
      case 'ACEPTADA': return 'Asesoría confirmada.';
      case 'RECHAZADA': return a.rechazadaPorId === this.yo ? 'La rechazaste.' : `${otro} la rechazó.`;
      case 'CANCELADA': return a.canceladaPorId === this.yo ? 'La cancelaste.' : `${otro} la canceló.`;
      case 'EXPIRADA': return 'Expiró sin respuesta.';
      case 'FINALIZADA': return 'Asesoría finalizada.';
    }
  }

  // ---------------- Acciones ----------------

  aceptar(a: AsesoriaResponse): void {
    this.ejecutar(a, this.service.aceptar(a.id), 'Asesoría aceptada.');
  }

  async rechazar(a: AsesoriaResponse): Promise<void> {
    const ok = await this.confirmacion.preguntar({
      titulo: '¿Rechazar la asesoría?',
      mensaje: `${a.materiaNombre} con ${this.contraparte(a).nombre}. Esta acción no se puede deshacer.`,
      confirmar: 'Sí, rechazar',
      peligro: true,
      icono: 'bi-x-circle',
    });
    if (ok) this.ejecutar(a, this.service.rechazar(a.id), 'Asesoría rechazada.');
  }

  async cancelar(a: AsesoriaResponse): Promise<void> {
    if (this.fueraDeVentana(a)) {
      this.notificaciones.error(`Solo puedes cancelar hasta ${HORAS_LIMITE_CANCELACION} horas antes de la asesoría.`);
      return;
    }
    const ok = await this.confirmacion.preguntar({
      titulo: '¿Cancelar la asesoría?',
      mensaje: `${a.materiaNombre} con ${this.contraparte(a).nombre}. Se le notificará a la otra persona.`,
      confirmar: 'Sí, cancelar',
      cancelar: 'Volver',
      peligro: true,
      icono: 'bi-slash-circle',
    });
    if (ok) this.ejecutar(a, this.service.cancelar(a.id), 'Asesoría cancelada.');
  }

  mensaje(a: AsesoriaResponse): void {
    this.chat.conectarWebSocket();
    this.chat.abrirConversacionCon(this.contraparte(a).id);
  }

  private ejecutar(a: AsesoriaResponse, accion: Observable<AsesoriaResponse>, ok: string, alTerminar?: () => void): void {
    this.procesando = a.id;
    accion.subscribe({
      next: actualizada => {
        this.reemplazar(actualizada);
        this.procesando = null;
        this.notificaciones.exito(ok);
        alTerminar?.();
      },
      error: err => {
        this.procesando = null;
        this.notificaciones.error(mensajeError(err, 'No se pudo completar la acción.'));
        // El estado pudo cambiar (p. ej. expiró): recargar para mostrar la verdad del backend
        if (err.status === 409 || err.status === 500) this.cargar();
      },
    });
  }

  private reemplazar(nueva: AsesoriaResponse): void {
    this.asesorias = [nueva, ...this.asesorias.filter(x => x.id !== nueva.id)];
  }

  // ---------------- Propuesta / contrapropuesta ----------------

  abrirPropuesta(a: AsesoriaResponse): void {
    this.propuesta = a;
    this.minFecha = ahoraInputLocal(30);
    this.formPropuesta = {
      inicio: aInputLocal(a.fechaInicioPropuesta),
      cierre: aInputLocal(a.fechaCierrePropuesta),
      precio: a.precio,
      motivo: null,
    };
  }

  get errorPropuesta(): string | null {
    const f = this.formPropuesta;
    if (!f.inicio || !f.cierre) return 'Indica inicio y cierre.';
    if (new Date(f.inicio) <= new Date()) return 'La fecha de inicio no puede estar en el pasado.';
    if (new Date(f.cierre) <= new Date(f.inicio)) return 'El cierre debe ser posterior al inicio.';
    if (!f.precio || f.precio <= 0) return 'El precio debe ser mayor que cero.';
    const a = this.propuesta;
    if (a && f.precio === a.precio && aLocalDateTime(f.inicio) === a.fechaInicioPropuesta.substring(0, 19)
        && aLocalDateTime(f.cierre) === a.fechaCierrePropuesta.substring(0, 19)) {
      return 'Cambia el precio o el horario para enviar una nueva propuesta.';
    }
    return null;
  }

  enviarPropuesta(): void {
    const a = this.propuesta;
    if (!a || this.errorPropuesta) return;
    const f = this.formPropuesta;
    this.ejecutar(
      a,
      this.service.proponer(a.id, {
        fechaInicioPropuesta: aLocalDateTime(f.inicio),
        fechaCierrePropuesta: aLocalDateTime(f.cierre),
        precio: f.precio!,
        motivo: f.motivo,
      }),
      'Propuesta enviada.',
      () => (this.propuesta = null)
    );
  }

  // ---------------- Reseñas ----------------

  abrirResena(a: AsesoriaResponse): void {
    const existente = this.resenas.get(a.id);
    this.resenaDe = a;
    this.formResena = { calificacion: existente?.calificacion ?? 0, descripcion: existente?.descripcion ?? '' };
  }

  guardarResena(): void {
    const a = this.resenaDe;
    if (!a || this.formResena.calificacion < 1) return;
    const req = { calificacion: this.formResena.calificacion, descripcion: this.formResena.descripcion.trim() };
    const accion = this.resenas.has(a.id) ? this.service.editarResena(a.id, req) : this.service.crearResena(a.id, req);
    this.procesando = a.id;
    accion.subscribe({
      next: r => {
        this.resenas = new Map(this.resenas).set(a.id, r);
        this.procesando = null;
        this.resenaDe = null;
        this.notificaciones.exito('¡Gracias por tu reseña!');
      },
      error: err => {
        this.procesando = null;
        this.notificaciones.error(mensajeError(err, 'No se pudo guardar la reseña.'));
      },
    });
  }

  async eliminarResena(): Promise<void> {
    const a = this.resenaDe;
    if (!a) return;
    const ok = await this.confirmacion.preguntar({
      titulo: '¿Eliminar tu reseña?',
      mensaje: 'La calificación dejará de contar en el promedio del tutor.',
      confirmar: 'Eliminar',
      peligro: true,
      icono: 'bi-trash',
    });
    if (!ok) return;
    this.procesando = a.id;
    this.service.eliminarResena(a.id).subscribe({
      next: () => {
        const m = new Map(this.resenas);
        m.delete(a.id);
        this.resenas = m;
        this.procesando = null;
        this.resenaDe = null;
        this.notificaciones.exito('Reseña eliminada.');
      },
      error: err => {
        this.procesando = null;
        this.notificaciones.error(mensajeError(err, 'No se pudo eliminar la reseña.'));
      },
    });
  }
}
