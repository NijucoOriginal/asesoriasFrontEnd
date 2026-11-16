import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MateriaTutor, ResenaResponse, TutorResponse } from '../dto/modelos';

/** Endpoints públicos de /api/tutores (TutorController + ResenaController). */
@Injectable({ providedIn: 'root' })
export class TutoresService {
  private readonly url = `${environment.backendUrl}/api/tutores`;

  constructor(private http: HttpClient) {}

  /** GET /api/tutores — tutores activos que dictan al menos una materia. */
  listar(): Observable<TutorResponse[]> {
    return this.http.get<TutorResponse[]>(this.url);
  }

  /** GET /api/tutores/{id} */
  obtener(id: number): Observable<TutorResponse> {
    return this.http.get<TutorResponse>(`${this.url}/${id}`);
  }

  /** GET /api/tutores/{id}/resenas — reseñas recibidas por el tutor. */
  resenas(id: number): Observable<ResenaResponse[]> {
    return this.http.get<ResenaResponse[]>(`${this.url}/${id}/resenas`);
  }

  /**
   * GET /api/tutores/{id}/materias — materias (con IDs y temas) que dicta el tutor.
   * OJO: la rama Cambio del backend todavía NO expone este endpoint; sin él no se pueden
   * obtener los materiaId/temasIds que exige POST /api/asesorias.
   */
  materias(id: number): Observable<MateriaTutor[]> {
    return this.http.get<MateriaTutor[]>(`${this.url}/${id}/materias`);
  }
}
