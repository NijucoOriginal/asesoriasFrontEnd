import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

/** Usa route.data.expectedRoles (ESTUDIANTE | MODERADOR). */
export const rolesGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  const expectedRoles: string[] = route.data['expectedRoles'] ?? [];
  const userRoles = authService.getRoles();
  return expectedRoles.some(role => userRoles.includes(role)) ? true : router.createUrlTree(['/unauthorized']);
};
