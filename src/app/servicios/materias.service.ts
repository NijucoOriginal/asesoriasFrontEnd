import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MateriaCatalogo } from '../dto/modelos';

@Injectable({ providedIn: 'root' })
export class MateriasService {
  private readonly base = environment.backendUrl;

  constructor(private http: HttpClient) {}

  /** GET /api/materias — catálogo público. */
  catalogo(): Observable<MateriaCatalogo[]> {
    return this.http.get<MateriaCatalogo[]>(`${this.base}/api/materias`);
  }

  /** GET /api/usuarios/me/materias — materias que dicto yo. */
  misMaterias(): Observable<MateriaCatalogo[]> {
    return this.http.get<MateriaCatalogo[]>(`${this.base}/api/usuarios/me/materias`);
  }

  /** PUT /api/usuarios/me/materias — reemplaza la lista completa. */
  guardarMisMaterias(materiaIds: number[]): Observable<MateriaCatalogo[]> {
    return this.http.put<MateriaCatalogo[]>(`${this.base}/api/usuarios/me/materias`, { materiaIds });
  }
}
