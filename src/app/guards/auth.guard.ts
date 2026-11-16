import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

/** Requiere sesión iniciada. */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Requiere sesión con cuenta ACTIVA (las INACTIVAS solo pueden ver perfil y reactivar). */
export const cuentaActivaGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }
  return authService.estaInactivo() ? router.createUrlTree(['/reactivar']) : true;
};

/** Solo para invitados (login, registro): si ya hay sesión, va al inicio. */
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
