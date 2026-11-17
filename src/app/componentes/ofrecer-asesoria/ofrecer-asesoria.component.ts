import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MateriasService } from '../../servicios/materias.service';
import { UsersService } from '../../servicios/users.service';
import { NotificacionService } from '../../servicios/notificacion.service';
import { mensajeError } from '../../servicios/api-error';
import { MateriaCatalogo } from '../../dto/modelos';

@Component({
  selector: 'app-ofrecer-asesoria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ofrecer-asesoria.component.html',
  styleUrls: ['./ofrecer-asesoria.component.css'],
})
export class OfrecerAsesoriaComponent implements OnInit {
  cargando = true;
  guardando = false;
  error: string | null = null;

  programaId: number | null = null;
  programaNombre = '';

  catalogo: MateriaCatalogo[] = [];
  seleccionadas = new Set<number>();
  originales = new Set<number>();

  constructor(
    private materias: MateriasService,
    private users: UsersService,
    private notificaciones: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    forkJoin({
      catalogo: this.materias.catalogo(),
      mias: this.materias.misMaterias(),
      perfil: this.users.miPerfil(),
    }).subscribe({
      next: ({ catalogo, mias, perfil }) => {
        this.catalogo = catalogo;
        this.programaId = perfil.programaId;
        this.programaNombre = perfil.programa ?? '';
        this.originales = new Set(mias.map(m => m.id));
        this.seleccionadas = new Set(this.originales);
        this.cargando = false;
      },
      error: err => {
        this.error = mensajeError(err, 'No se pudo cargar la información.');
        this.cargando = false;
      },
    });
  }

  get sinCarrera(): boolean {
    return this.programaId == null;
  }

  /** Solo las materias de la carrera principal. Las demás no se muestran: el backend las rechazaría. */
  get materiasDeMiCarrera(): MateriaCatalogo[] {
    return this.catalogo.filter(m => m.programaId === this.programaId);
  }

  filtro = '';

  get materiasFiltradas(): MateriaCatalogo[] {
    const q = this.filtro.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    if (!q) return this.materiasDeMiCarrera;
    return this.materiasDeMiCarrera.filter(m =>
      m.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)
    );
  }

  get hayCambios(): boolean {
    if (this.seleccionadas.size !== this.originales.size) return true;
    for (const id of this.seleccionadas) if (!this.originales.has(id)) return true;
    return false;
  }

  estaMarcada(id: number): boolean {
    return this.seleccionadas.has(id);
  }

  alternar(id: number, marcado: boolean): void {
    const nuevas = new Set(this.seleccionadas);
    marcado ? nuevas.add(id) : nuevas.delete(id);
    this.seleccionadas = nuevas;
  }

  descartar(): void {
    this.seleccionadas = new Set(this.originales);
  }

  guardar(): void {
    if (!this.hayCambios || this.guardando) return;
    this.guardando = true;
    this.materias.guardarMisMaterias([...this.seleccionadas]).subscribe({
      next: lista => {
        this.originales = new Set(lista.map(m => m.id));
        this.seleccionadas = new Set(this.originales);
        this.guardando = false;
        this.notificaciones.exito('Materias actualizadas. Ya puedes recibir solicitudes.');
      },
      error: err => {
        this.guardando = false;
        this.notificaciones.error(mensajeError(err, 'No se pudieron guardar las materias.'));
      },
    });
  }
}
