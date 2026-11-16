import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { EstadoUsuario, Rol, TokenClaims, TokenResponse } from '../dto/modelos';
import { RedireccionService } from './redireccion.service';
import { NotificacionService } from './notificacion.service';
import { mensajeError } from './api-error';

/**
 * Sesión del usuario. El backend (AuthController) entrega un JWT con los claims:
 * sub (email), id, rol, nombre, apellido, telefono, documentoIdentidad, estado.
 * Solo se guarda el token; todos los datos se leen decodificándolo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly url = `${environment.backendUrl}/api/auth`;
  private readonly TOKEN_KEY = 'authToken';

  private _sesion = new BehaviorSubject<TokenClaims | null>(this.leerClaims());
  /** Emite los datos del usuario logueado (o null) cada vez que cambia la sesión. */
  sesion$ = this._sesion.asObservable();

  constructor(
    private http: HttpClient,
    private redireccionService: RedireccionService,
    private notificaciones: NotificacionService
  ) {}

  // ---------------- Autenticación ----------------

  login(email: string, contrasena: string, recaptchaToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/login`, { email, contrasena, recaptchaToken }).pipe(
      tap(res => {
        this.cambiarDatosToken(res);
        this.notificaciones.exito('Inicio de sesión exitoso');
      }),
      catchError(err => {
        const msg = mensajeError(err, 'Error al iniciar sesión');
        this.notificaciones.error(msg);
        return throwError(() => new Error(msg));
      })
    );
  }

  /** Guarda un token nuevo (login, actualización de perfil o reactivación). */
  cambiarDatosToken(response: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this._sesion.next(this.leerClaims());
  }

  isAuthenticated(): boolean {
    const claims = this.leerClaims();
    if (!claims) {
      if (localStorage.getItem(this.TOKEN_KEY)) this.limpiarStorage();
      return false;
    }
    return true;
  }

  logout(): void {
    this.limpiarStorage();
    this.redireccionService.redirigirAHome();
  }

  limpiarStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._sesion.next(null);
  }

  // ---------------- Datos de la sesión ----------------

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getClaims(): TokenClaims | null {
    return this._sesion.getValue() ?? this.leerClaims();
  }

  getRoles(): string[] {
    const c = this.getClaims();
    return c?.rol ? [c.rol] : [];
  }

  decodeTokenRoles(): string[] {
    return this.getRoles();
  }

  getRol(): Rol | null { return this.getClaims()?.rol ?? null; }
  getEstado(): EstadoUsuario | null { return this.getClaims()?.estado ?? null; }
  estaInactivo(): boolean { return this.getEstado() === 'INACTIVO'; }

  getUserEmail(): string | null { return this.getClaims()?.sub ?? null; }
  obtenerIdUsuario(): string | null {
    const id = this.getClaims()?.id;
    return id != null ? String(id) : null;
  }
  obtenerNombreUsuario(): string | null { return this.getClaims()?.nombre ?? null; }
  obtenerApellidoUsuario(): string | null { return this.getClaims()?.apellido ?? null; }
  obtenerTelefonoUsuario(): string | null { return this.getClaims()?.telefono ?? null; }
  obtenerDocumentoUsuario(): string | null { return this.getClaims()?.documentoIdentidad ?? null; }
  nombreCompleto(): string {
    const c = this.getClaims();
    return c ? `${c.nombre ?? ''} ${c.apellido ?? ''}`.trim() : '';
  }

  // ---------------- Recuperación de contraseña y contacto ----------------

  enviarCodigoRecuperacion(email: string, recaptchaToken: string): Observable<string> {
    return this.http.post(`${this.url}/recuperar`, { email, recaptchaToken }, { responseType: 'text' }).pipe(
      tap(msg => this.notificaciones.exito(msg || 'Si el correo está registrado, recibirás un código.')),
      catchError(err => {
        const msg = mensajeError(err, 'Error al solicitar la recuperación');
        this.notificaciones.error(msg);
        return throwError(() => msg);
      })
    );
  }

  cambiarContrasenaConCodigo(email: string, codigo: string, nuevaContrasena: string): Observable<string> {
    return this.http
      .post(`${this.url}/recuperar/cambiar`, { email, codigo, nuevaContrasena }, { responseType: 'text' })
      .pipe(
        tap(() => this.notificaciones.exito('Contraseña actualizada correctamente')),
        catchError(err => {
          const msg = mensajeError(err, 'Código inválido o expirado');
          this.notificaciones.error(msg);
          return throwError(() => err);
        })
      );
  }

  enviarContacto(data: {
    nombre: string;
    telefono: string;
    correo: string;
    asunto: string;
    mensaje: string;
    recaptchaToken: string;
  }): Observable<string> {
    return this.http.post(`${this.url}/contacto`, data, { responseType: 'text' }).pipe(
      tap(() => this.notificaciones.exito('Mensaje enviado correctamente')),
      catchError(err => {
        const msg = mensajeError(err, 'Error al enviar el mensaje');
        this.notificaciones.error(msg);
        return throwError(() => err);
      })
    );
  }

  /** Compatibilidad con componentes antiguos. */
  showAlert(type: 'success' | 'error', message: string): void {
    type === 'success' ? this.notificaciones.exito(message) : this.notificaciones.error(message);
  }

  // ---------------- Internos ----------------

  private leerClaims(): TokenClaims | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      const claims = jwtDecode<TokenClaims>(token);
      if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
      return claims;
    } catch {
      return null;
    }
  }
}
