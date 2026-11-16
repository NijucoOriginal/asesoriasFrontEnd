import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearUsuarioRequest, PerfilResponse, TokenResponse, UserResponse } from '../dto/modelos';
import { AuthService } from './auth.service';

/** Endpoints de /api/usuarios (UserController + CuentaController). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly url = `${environment.backendUrl}/api/usuarios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** POST /api/usuarios — registro (público, requiere reCAPTCHA). */
  registrar(user: CrearUsuarioRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.url, user);
  }

  /** GET /api/usuarios/me — perfil del usuario logueado (también para cuentas INACTIVAS). */
  miPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.url}/me`);
  }

  /** PUT /api/usuarios/imagen — multipart con el campo "imagen". */
  actualizarImagen(archivo: File): Observable<string> {
    const form = new FormData();
    form.append('imagen', archivo);
    return this.http
      .put<{ imagenPerfil: string }>(`${this.url}/imagen`, form)
      .pipe(map(r => r.imagenPerfil));
  }

  /**
   * PUT /api/usuarios/actualizar/{email} — el backend solo cambia nombre, apellido y teléfono
   * y devuelve un token nuevo con los datos actualizados, que se guarda en la sesión.
   */
  actualizarDatosUsuario(email: string, nombre: string, apellido: string, telefono: string): Observable<TokenResponse> {
    const body = { nombre, apellido, telefono };
    return this.http
      .put<TokenResponse>(`${this.url}/actualizar/${encodeURIComponent(email)}`, body)
      .pipe(tap(res => this.authService.cambiarDatosToken(res)));
  }

  /** PUT /api/usuarios/desvincular/{email} — desactiva la cuenta (pasa a INACTIVO). */
  desvincular(email: string): Observable<string> {
    return this.http.put(`${this.url}/desvincular/${encodeURIComponent(email)}`, {}, { responseType: 'text' });
  }

  /** POST /api/usuarios/reactivar/solicitar — envía un código al correo (solo cuentas INACTIVAS). */
  solicitarReactivacion(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/reactivar/solicitar`, {});
  }

  /** POST /api/usuarios/reactivar/confirmar — confirma el código y devuelve un token ACTIVO. */
  confirmarReactivacion(codigo: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.url}/reactivar/confirmar`, { codigo })
      .pipe(tap(res => this.authService.cambiarDatosToken(res)));
  }
}
