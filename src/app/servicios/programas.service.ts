import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilResponse, ProgramaCatalogo } from '../dto/modelos';

@Injectable({ providedIn: 'root' })
export class ProgramasService {
  private readonly base = environment.backendUrl;

  constructor(private http: HttpClient) {}

  /** GET /api/programas — catálogo público. */
  catalogo(): Observable<ProgramaCatalogo[]> {
    return this.http.get<ProgramaCatalogo[]>(`${this.base}/api/programas`);
  }

  /** PUT /api/usuarios/me/programa — cambia la carrera principal. */
  cambiarPrograma(programaId: number): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(`${this.base}/api/usuarios/me/programa`, { programaId });
  }
}
