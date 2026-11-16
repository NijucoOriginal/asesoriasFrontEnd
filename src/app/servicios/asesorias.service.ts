import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AsesoriaResponse,
  CrearAsesoriaRequest,
  ProponerAsesoriaRequest,
  ResenaRequest,
  ResenaResponse,
} from '../dto/modelos';

/** Endpoints de /api/asesorias (AsesoriaController + ResenaController). Requieren cuenta ACTIVA. */
@Injectable({ providedIn: 'root' })
export class AsesoriasService {
  private readonly url = `${environment.backendUrl}/api/asesorias`;

  constructor(private http: HttpClient) {}

  /** GET /api/asesorias — asesorías donde participo como tutor o como estudiante. */
  listar(): Observable<AsesoriaResponse[]> {
    return this.http.get<AsesoriaResponse[]>(this.url);
  }

  /** POST /api/asesorias — el estudiante solicita una asesoría a un tutor. */
  crear(req: CrearAsesoriaRequest): Observable<AsesoriaResponse> {
    return this.http.post<AsesoriaResponse>(this.url, req);
  }

  /** PUT /api/asesorias/{id}/proponer — contrapropuesta (tutor) o reenvío (estudiante). */
  proponer(id: number, req: ProponerAsesoriaRequest): Observable<AsesoriaResponse> {
    return this.http.put<AsesoriaResponse>(`${this.url}/${id}/proponer`, req);
  }

  aceptar(id: number): Observable<AsesoriaResponse> {
    return this.http.put<AsesoriaResponse>(`${this.url}/${id}/aceptar`, {});
  }

  rechazar(id: number): Observable<AsesoriaResponse> {
    return this.http.put<AsesoriaResponse>(`${this.url}/${id}/rechazar`, {});
  }

  cancelar(id: number): Observable<AsesoriaResponse> {
    return this.http.put<AsesoriaResponse>(`${this.url}/${id}/cancelar`, {});
  }

  // ---------- Reseñas (solo el estudiante, asesoría FINALIZADA) ----------

  crearResena(asesoriaId: number, req: ResenaRequest): Observable<ResenaResponse> {
    return this.http.post<ResenaResponse>(`${this.url}/${asesoriaId}/resena`, req);
  }

  editarResena(asesoriaId: number, req: ResenaRequest): Observable<ResenaResponse> {
    return this.http.put<ResenaResponse>(`${this.url}/${asesoriaId}/resena`, req);
  }

  eliminarResena(asesoriaId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${asesoriaId}/resena`);
  }
}
