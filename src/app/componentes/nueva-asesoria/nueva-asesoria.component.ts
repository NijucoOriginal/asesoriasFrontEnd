import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsesoriasService } from '../../servicios/asesorias.service';
import { TutoresService } from '../../servicios/tutores.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { aLocalDateTime, ahoraInputLocal } from '../../servicios/fechas';
import { MateriaTutor } from '../../dto/modelos';

@Component({
  selector: 'app-nueva-asesoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nueva-asesoria.component.html',
  styleUrls: ['./nueva-asesoria.component.css'],
})
export class NuevaAsesoriaComponent implements OnInit {
  tutorId = 0;
  tutorNombre = '';
  materias: MateriaTutor[] = [];
  cargando = true;
  enviando = false;
  error: string | null = null;
  minFecha = ahoraInputLocal(30);

  form = {
    materiaId: null as number | null,
    temasIds: [] as number[],
    inicio: '',
    cierre: '',
    precio: null as number | null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asesorias: AsesoriasService,
    private tutores: TutoresService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.tutorId = Number(this.route.snapshot.paramMap.get('tutorId'));

    // Si TutoresService no tiene obtener(id), quita este bloque y muestra solo "Tutor".
    this.tutores.obtener(this.tutorId).subscribe({
      next: t => (this.tutorNombre = `${t.nombre} ${t.apellido}`),
    });

    this.asesorias.materiasDeTutor(this.tutorId).subscribe({
      next: m => {
        this.materias = m;
        this.cargando = false;
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudieron cargar las materias del tutor.');
        this.cargando = false;
      },
    });
  }

  get temasDisponibles() {
    return this.materias.find(m => m.id === this.form.materiaId)?.temas ?? [];
  }

  /** Al cambiar de materia se descartan los temas seleccionados de la anterior. */
  onMateriaChange(): void {
    this.form.temasIds = [];
  }

  toggleTema(id: number, marcado: boolean): void {
    this.form.temasIds = marcado
      ? [...this.form.temasIds, id]
      : this.form.temasIds.filter(t => t !== id);
  }

  get errorFormulario(): string | null {
    const f = this.form;
    if (!f.materiaId) return 'Selecciona una materia.';
    if (!f.inicio || !f.cierre) return 'Indica inicio y cierre.';
    if (new Date(f.inicio) <= new Date()) return 'La fecha de inicio no puede estar en el pasado.';
    if (new Date(f.cierre) <= new Date(f.inicio)) return 'El cierre debe ser posterior al inicio.';
    if (!f.precio || f.precio <= 0) return 'El precio debe ser mayor que cero.';
    return null;
  }

  enviar(): void {
    if (this.errorFormulario) {
      this.notificaciones.error(this.errorFormulario);
      return;
    }
    this.enviando = true;
    const f = this.form;
    this.asesorias
      .crear({
        asesorId: this.tutorId,
        materiaId: f.materiaId!,
        temasIds: f.temasIds,
        fechaInicioPropuesta: aLocalDateTime(f.inicio),
        fechaCierrePropuesta: aLocalDateTime(f.cierre),
        precio: f.precio!,
      })
      .subscribe({
        next: () => {
          this.notificaciones.exito('Solicitud enviada al tutor.');
          this.router.navigate(['/asesorias']);
        },
        error: err => {
          this.enviando = false;
          this.notificaciones.error(mensajeError(err, 'No se pudo crear la asesoría.'));
        },
      });
  }
}
