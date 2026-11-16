import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedireccionService } from '../../servicios/redireccion.service';
import { IdiomaService } from '../../servicios/idioma.service';
import { ES } from '../../i18n/es';
import { Subscription } from 'rxjs';

export interface TutorDestacado {
  nombreCompleto: string;
  carrera: string;
  materias: string[];
  foto: string;
  horasTutoria: number;
}

@Component({
  selector: 'app-inicio-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-default.component.html',
  styleUrls: ['./inicio-default.component.css']
})
export class InicioDefaultComponent implements OnInit, OnDestroy {
  t: typeof ES;
  private sub!: Subscription;

  tutoresDestacados: TutorDestacado[] = [
    {
      nombreCompleto: 'Carlos Andrés Gómez Ríos',
      carrera: 'Ingeniería de Sistemas',
      materias: ['Programación orientada a objetos', 'Bases de datos', 'Estructuras de datos'],
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
      horasTutoria: 120
    },
    {
      nombreCompleto: 'María Fernanda López Torres',
      carrera: 'Licenciatura en Matemáticas',
      materias: ['Cálculo diferencial', 'Álgebra lineal', 'Estadística'],
      foto: 'https://randomuser.me/api/portraits/women/44.jpg',
      horasTutoria: 95
    },
    {
      nombreCompleto: 'Laura Valentina Herrera Castaño',
      carrera: 'Pedagogía Infantil',
      materias: ['Psicología del desarrollo', 'Didáctica infantil', 'Literatura infantil'],
      foto: 'https://randomuser.me/api/portraits/women/65.jpg',
      horasTutoria: 80
    },
    {
      nombreCompleto: 'Juan Esteban Moreno Ospina',
      carrera: 'Química',
      materias: ['Química orgánica', 'Química general', 'Fisicoquímica'],
      foto: 'https://randomuser.me/api/portraits/men/45.jpg',
      horasTutoria: 110
    },
    {
      nombreCompleto: 'Daniela Alejandra Ramírez Muñoz',
      carrera: 'Enfermería',
      materias: ['Anatomía y fisiología', 'Farmacología', 'Fundamentos de enfermería'],
      foto: 'https://randomuser.me/api/portraits/women/12.jpg',
      horasTutoria: 70
    }
  ];

  constructor(
    protected redireccionamiento: RedireccionService,
    public idiomaService: IdiomaService
  ) {
    this.t = idiomaService.t;
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => {
      this.t = t;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
