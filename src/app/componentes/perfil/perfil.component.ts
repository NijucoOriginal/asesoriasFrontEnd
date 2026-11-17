import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../servicios/users.service';
import { AuthService } from '../../servicios/auth.service';
import { AsesoriasService } from '../../servicios/asesorias.service';
import { ChatService } from '../../servicios/chat.service';
import { ProgramasService } from '../../servicios/programas.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { AsesoriaResponse, PerfilResponse, ProgramaCatalogo } from '../../dto/modelos';

const MAX_IMAGEN_MB = 20;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  perfil: PerfilResponse | null = null;
  cargando = true;
  error: string | null = null;

  editando = false;
  guardando = false;
  subiendoImagen = false;
  desvinculando = false;
  form: FormGroup;

  // Carrera
  programas: ProgramaCatalogo[] = [];
  programaSel: number | null = null;
  guardandoPrograma = false;

  resumen = { comoEstudiante: 0, comoTutor: 0, finalizadas: 0, enCurso: 0 };

  constructor(
    fb: FormBuilder,
    private users: UsersService,
    private auth: AuthService,
    private asesorias: AsesoriasService,
    private chat: ChatService,
    private programasService: ProgramasService,
    private notificaciones: NotificacionService,
    private router: Router
  ) {
    this.form = fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.programasService.catalogo().subscribe({ next: p => (this.programas = p) });
  }

  get activo(): boolean {
    return this.perfil?.estado === 'ACTIVO';
  }

  get sinCarrera(): boolean {
    return !!this.perfil && this.perfil.programaId == null;
  }

  get iniciales(): string {
    return `${this.perfil?.nombre?.[0] ?? ''}${this.perfil?.apellido?.[0] ?? ''}`.toUpperCase();
  }

  cargar(): void {
    this.cargando = true;
    this.users.miPerfil().subscribe({
      next: p => {
        this.perfil = p;
        this.cargando = false;
        if (p.estado === 'ACTIVO') this.cargarResumen(p.id);
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudo cargar tu perfil.');
        this.cargando = false;
      },
    });
  }

  private cargarResumen(yo: number): void {
    this.asesorias.listar().subscribe({
      next: (lista: AsesoriaResponse[]) => {
        this.resumen = {
          comoEstudiante: lista.filter(a => a.participante.id === yo).length,
          comoTutor: lista.filter(a => a.asesor.id === yo).length,
          finalizadas: lista.filter(a => a.estado === 'FINALIZADA').length,
          enCurso: lista.filter(a => ['PENDIENTE', 'CONTRAPROPUESTA', 'ACEPTADA'].includes(a.estado)).length,
        };
      },
      error: () => {},
    });
  }

  editar(): void {
    if (!this.perfil) return;
    this.form.reset({ nombre: this.perfil.nombre, apellido: this.perfil.apellido, telefono: this.perfil.telefono });
    this.editando = true;
  }

  guardar(): void {
    if (!this.perfil || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, apellido, telefono } = this.form.value;
    this.guardando = true;
    this.users.actualizarDatosUsuario(this.perfil.email, nombre.trim(), apellido.trim(), telefono.trim()).subscribe({
      next: () => {
        this.perfil = { ...this.perfil!, nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() };
        this.guardando = false;
        this.editando = false;
        this.notificaciones.exito('Datos actualizados.');
      },
      error: err => {
        this.guardando = false;
        this.notificaciones.error(mensajeError(err, 'No se pudieron guardar los cambios.'));
      },
    });
  }

  guardarPrograma(): void {
    if (!this.programaSel || this.guardandoPrograma) return;
    this.guardandoPrograma = true;
    this.programasService.cambiarPrograma(this.programaSel).subscribe({
      next: p => {
        this.perfil = p;
        this.programaSel = null;
        this.guardandoPrograma = false;
        this.notificaciones.exito('Carrera guardada.');
      },
      error: err => {
        this.guardandoPrograma = false;
        this.notificaciones.error(mensajeError(err, 'No se pudo cambiar la carrera.'));
      },
    });
  }

  onImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo || !this.perfil) return;
    if (!archivo.type.startsWith('image/')) {
      this.notificaciones.error('El archivo debe ser una imagen.');
      return;
    }
    if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.notificaciones.error(`La imagen no puede superar ${MAX_IMAGEN_MB} MB.`);
      return;
    }
    this.subiendoImagen = true;
    this.users.actualizarImagen(archivo).subscribe({
      next: url => {
        this.perfil = { ...this.perfil!, imagenPerfil: url };
        this.subiendoImagen = false;
        this.notificaciones.exito('Foto de perfil actualizada.');
      },
      error: err => {
        this.subiendoImagen = false;
        this.notificaciones.error(mensajeError(err, 'No se pudo subir la imagen.'));
      },
    });
  }

  desvincular(): void {
    if (!this.perfil) return;
    const ok = confirm(
      'Al desactivar tu cuenta se rechazarán o cancelarán tus asesorías abiertas y no podrás usar la plataforma ' +
      'hasta reactivarla. ¿Deseas continuar?'
    );
    if (!ok) return;
    this.desvinculando = true;
    this.users.desvincular(this.perfil.email).subscribe({
      next: () => {
        this.desvinculando = false;
        this.notificaciones.info('Tu cuenta fue desactivada. Puedes reactivarla iniciando sesión de nuevo.');
        this.chat.desconectarWebSocket();
        this.auth.limpiarStorage();
        this.router.navigate(['/']);
      },
      error: err => {
        this.desvinculando = false;
        this.notificaciones.error(mensajeError(err, 'No se pudo desactivar la cuenta.'));
      },
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
