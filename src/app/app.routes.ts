import { Routes } from '@angular/router';
import { InicioDefaultComponent } from './componentes/inicio-default/inicio-default.component';
import { authGuard, cuentaActivaGuard, invitadoGuard } from './guards/auth.guard';

/** Todas las páginas salvo el inicio se cargan bajo demanda (carga inicial más liviana). */
export const routes: Routes = [
  // Públicas
  { path: '', component: InicioDefaultComponent, title: 'Asesorías Edén' },
  {
    path: 'tutores',
    loadComponent: () => import('./componentes/tutores/tutores.component').then(m => m.TutoresComponent),
    title: 'Tutores · Asesorías Edén',
  },
  {
    path: 'tutores/:id',
    loadComponent: () => import('./componentes/tutor-detalle/tutor-detalle.component').then(m => m.TutorDetalleComponent),
    title: 'Tutor · Asesorías Edén',
  },
  {
    path: 'conocenos',
    loadComponent: () => import('./componentes/conocenos/conocenos.component').then(m => m.ConocenosComponent),
    title: 'Conócenos · Asesorías Edén',
  },
  {
    path: 'contactenos',
    loadComponent: () => import('./componentes/contactenos/contactenos.component').then(m => m.ContactenosComponent),
    title: 'Contáctenos · Asesorías Edén',
  },
  {
    path: 'politicaDatos',
    loadComponent: () =>
      import('./componentes/politica-tratamiento-datos/politica-tratamiento-datos.component').then(m => m.PoliticaTratamientoDatosComponent),
    title: 'Política de datos · Asesorías Edén',
  },

  // Cuenta (invitados)
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./componentes/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar sesión · Asesorías Edén',
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./componentes/registro/registro.component').then(m => m.RegistroComponent),
    title: 'Registro · Asesorías Edén',
  },
  {
    path: 'activar',
    loadComponent: () => import('./componentes/activar-cuenta/activar.component').then(m => m.ActivarComponent),
    title: 'Activar cuenta · Asesorías Edén',
  },
  {
    path: 'recuperar',
    loadComponent: () =>
      import('./componentes/recuperar-contrasena/recuperar-contrasena.component').then(m => m.RecuperarContrasenaComponent),
    title: 'Recuperar contraseña · Asesorías Edén',
  },
  {
    path: 'cambiar-contrasena',
    loadComponent: () =>
      import('./componentes/cambiar-contrasena/cambiar-contrasena.component').then(m => m.CambiarContrasenaComponent),
    title: 'Cambiar contraseña · Asesorías Edén',
  },

  // Con sesión
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/perfil/perfil.component').then(m => m.PerfilComponent),
    title: 'Mi perfil · Asesorías Edén',
  },
  {
    path: 'reactivar',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/reactivar/reactivar.component').then(m => m.ReactivarComponent),
    title: 'Reactivar cuenta · Asesorías Edén',
  },
  {
    path: 'asesorias',
    canActivate: [cuentaActivaGuard],
    loadComponent: () => import('./componentes/asesorias/asesorias.component').then(m => m.AsesoriasComponent),
    title: 'Mis asesorías · Asesorías Edén',
  },
  {
    path: 'asesorias/nueva/:tutorId',
    canActivate: [cuentaActivaGuard],
    loadComponent: () => import('./componentes/nueva-asesoria/nueva-asesoria.component').then(m => m.NuevaAsesoriaComponent),
    title: 'Solicitar asesoría · Asesorías Edén',
  },
  {
    path: 'ofrecer-asesoria',
    canActivate: [cuentaActivaGuard],
    loadComponent: () => import('./componentes/ofrecer-asesoria/ofrecer-asesoria.component').then(m => m.OfrecerAsesoriaComponent),
    title: 'Materias que enseño · Asesorías Edén',
  },

  // Compatibilidad con rutas antiguas
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: 'catalogo', redirectTo: 'tutores', pathMatch: 'full' },

  {
    path: 'unauthorized',
    loadComponent: () => import('./componentes/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Sin acceso · Asesorías Edén',
  },

  // Siempre al final
  {
    path: '**',
    loadComponent: () => import('./componentes/no-encontrado/no-encontrado.component').then(m => m.NoEncontradoComponent),
    title: 'Página no encontrada · Asesorías Edén',
  },
];
