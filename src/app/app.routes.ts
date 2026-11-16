import { Routes } from '@angular/router';
import { InicioDefaultComponent } from './componentes/inicio-default/inicio-default.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { ActivarComponent } from './componentes/activar-cuenta/activar.component';
import { RecuperarContrasenaComponent } from './componentes/recuperar-contrasena/recuperar-contrasena.component';
import { CambiarContrasenaComponent } from './componentes/cambiar-contrasena/cambiar-contrasena.component';
import { ConocenosComponent } from './componentes/conocenos/conocenos.component';
import { ContactenosComponent } from './componentes/contactenos/contactenos.component';
import { PoliticaTratamientoDatosComponent } from './componentes/politica-tratamiento-datos/politica-tratamiento-datos.component';
import { UnauthorizedComponent } from './componentes/unauthorized/unauthorized.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { TutoresComponent } from './componentes/tutores/tutores.component';
import { TutorDetalleComponent } from './componentes/tutor-detalle/tutor-detalle.component';
import { AsesoriasComponent } from './componentes/asesorias/asesorias.component';
import { ReactivarComponent } from './componentes/reactivar/reactivar.component';
import { authGuard, cuentaActivaGuard, invitadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Públicas
  { path: '', component: InicioDefaultComponent, title: 'Asesorías Edén' },
  { path: 'tutores', component: TutoresComponent, title: 'Tutores · Asesorías Edén' },
  { path: 'tutores/:id', component: TutorDetalleComponent, title: 'Tutor · Asesorías Edén' },
  { path: 'conocenos', component: ConocenosComponent, title: 'Conócenos · Asesorías Edén' },
  { path: 'contactenos', component: ContactenosComponent, title: 'Contáctenos · Asesorías Edén' },
  { path: 'politicaDatos', component: PoliticaTratamientoDatosComponent, title: 'Política de datos · Asesorías Edén' },

  // Cuenta (invitados)
  { path: 'login', component: LoginComponent, canActivate: [invitadoGuard], title: 'Iniciar sesión · Asesorías Edén' },
  { path: 'registro', component: RegistroComponent, canActivate: [invitadoGuard], title: 'Registro · Asesorías Edén' },
  { path: 'activar', component: ActivarComponent, title: 'Activar cuenta · Asesorías Edén' },
  { path: 'recuperar', component: RecuperarContrasenaComponent, title: 'Recuperar contraseña · Asesorías Edén' },
  { path: 'cambiar-contrasena', component: CambiarContrasenaComponent, title: 'Cambiar contraseña · Asesorías Edén' },

  // Con sesión
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard], title: 'Mi perfil · Asesorías Edén' },
  { path: 'reactivar', component: ReactivarComponent, canActivate: [authGuard], title: 'Reactivar cuenta · Asesorías Edén' },
  { path: 'asesorias', component: AsesoriasComponent, canActivate: [cuentaActivaGuard], title: 'Mis asesorías · Asesorías Edén' },

  // Compatibilidad con rutas antiguas
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: 'catalogo', redirectTo: 'tutores', pathMatch: 'full' },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' },
];
