import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { environment } from '../../environments/environment';

/**
 * Adjunta el JWT a toda petición hacia el backend cuando hay sesión.
 * - 401: el token ya no sirve → se cierra la sesión.
 * - 403 con cuenta INACTIVA: se envía a la pantalla de reactivación.
 */
export const usuarioInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const esBackend = req.url.startsWith(environment.backendUrl);
  const token = esBackend && authService.isAuthenticated() ? authService.getToken() : null;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (token && error.status === 401) {
        authService.limpiarStorage();
        router.navigate(['/login']);
      } else if (token && error.status === 403 && authService.estaInactivo()) {
        router.navigate(['/reactivar']);
      }
      return throwError(() => error);
    })
  );
};
