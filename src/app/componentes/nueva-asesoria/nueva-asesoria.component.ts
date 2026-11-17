import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsesoriasService } from '../../servicios/asesorias.service';
import { TutoresService } from '../../servicios/tutores.service';
import { AuthService } from '../../servicios/auth.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { MateriaTutor, TutorResponse } from '../../dto/modelos';
import { EstrellasComponent } from '../estrellas/estrellas.component';

const pad = (n: number) => String(n).padStart(2, '0');
const fechaLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Solicitud de asesoría a un tutor (POST /api/asesorias). */
@Component({
  selector: 'app-nueva-asesoria',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, EstrellasComponent],
  templateUrl: './nueva-asesoria.component.html',
  styleUrls: ['./nueva-asesoria.component.css'],
})
export class NuevaAsesoriaComponent implements OnInit {
  tutorId = 0;
  tutor: TutorResponse | null = null;
  materias: MateriaTutor[] = [];
  cargando = true;
  enviando = false;
  intentoEnviar = false;
  error: string | null = null;

  readonly duraciones = [
    { minutos: 60, texto: '1 hora' },
    { minutos: 90, texto: '1 h 30 min' },
    { minutos: 120, texto: '2 horas' },
    { minutos: 180, texto: '3 horas' },
  ];
  readonly preciosSugeridos = [20000, 30000, 40000, 50000];
  readonly hoy = fechaLocal(new Date());

  form = {
    materiaId: null as number | null,
    temasIds: [] as number[],
    fecha: '',
    hora: '',
    duracion: 60,
    precio: null as number | null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asesorias: AsesoriasService,
    private tutores: TutoresService,
    private auth: AuthService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.tutorId = Number(this.route.snapshot.paramMap.get('tutorId'));
    if (String(this.tutorId) === this.auth.obtenerIdUsuario()) {
      this.error = 'No puedes solicitarte una asesoría a ti mismo.';
      this.cargando = false;
      return;
    }
    this.tutores.obtener(this.tutorId).subscribe({
      next: t => (this.tutor = t),
      error: () => {},
    });
    this.asesorias.materiasDeTutor(this.tutorId).subscribe({
      next: m => {
        this.materias = m;
        if (m.length === 1) this.form.materiaId = m[0].id;
        this.cargando = false;
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudieron cargar las materias del tutor.');
        this.cargando = false;
      },
    });
  }

  get nombreTutor(): string {
    return this.tutor ? `${this.tutor.nombre} ${this.tutor.apellido}` : 'el tutor';
  }

  get iniciales(): string {
    return `${this.tutor?.nombre?.[0] ?? ''}${this.tutor?.apellido?.[0] ?? ''}`.toUpperCase();
  }

  get materiaSeleccionada(): MateriaTutor | undefined {
    return this.materias.find(m => m.id === this.form.materiaId);
  }

  get temasDisponibles() {
    return this.materiaSeleccionada?.temas ?? [];
  }

  /** Inicio y cierre calculados a partir de fecha + hora + duración. */
  get inicio(): Date | null {
    if (!this.form.fecha || !this.form.hora) return null;
    const d = new Date(`${this.form.fecha}T${this.form.hora}`);
    return isNaN(d.getTime()) ? null : d;
  }

  get cierre(): Date | null {
    const i = this.inicio;
    return i ? new Date(i.getTime() + this.form.duracion * 60000) : null;
  }

  seleccionarMateria(id: number): void {
    if (this.form.materiaId === id) return;
    this.form.materiaId = id;
    this.form.temasIds = [];
  }

  toggleTema(id: number): void {
    this.form.temasIds = this.form.temasIds.includes(id)
      ? this.form.temasIds.filter(t => t !== id)
      : [...this.form.temasIds, id];
  }

  get errores(): { materia?: string; fecha?: string; precio?: string } {
    const e: { materia?: string; fecha?: string; precio?: string } = {};
    if (!this.form.materiaId) e.materia = 'Elige una materia.';
    const i = this.inicio;
    if (!i) e.fecha = 'Elige el día y la hora.';
    else if (i.getTime() <= Date.now() + 15 * 60000) e.fecha = 'La asesoría debe empezar al menos 15 minutos en el futuro.';
    if (!this.form.precio || this.form.precio <= 0) e.precio = 'Propón un precio mayor que cero.';
    return e;
  }

  get valido(): boolean {
    return Object.keys(this.errores).length === 0;
  }

  enviar(): void {
    this.intentoEnviar = true;
    if (!this.valido || this.enviando) return;
    this.enviando = true;
    const local = (d: Date) => `${fechaLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    this.asesorias
      .crear({
        asesorId: this.tutorId,
        materiaId: this.form.materiaId!,
        temasIds: this.form.temasIds,
        fechaInicioPropuesta: local(this.inicio!),
        fechaCierrePropuesta: local(this.cierre!),
        precio: this.form.precio!,
      })
      .subscribe({
        next: () => {
          this.notificaciones.exito(`¡Solicitud enviada a ${this.nombreTutor}! Te avisaremos cuando responda.`);
          this.router.navigate(['/asesorias']);
        },
        error: err => {
          this.enviando = false;
          this.notificaciones.error(mensajeError(err, 'No se pudo enviar la solicitud.'));
        },
      });
  }
}
