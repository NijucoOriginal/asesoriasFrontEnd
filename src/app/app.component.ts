import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { FooterComponent } from './componentes/footer/footer.component';
import { AccesibilidadComponent } from './componentes/accesibilidad/accesibilidad.component';
import { ChatFlotanteComponent } from './componentes/chat-flotante/chat-flotante.component';
import { ToastsComponent } from './componentes/toasts/toasts.component';
import { ConfirmacionComponent } from './componentes/confirmacion/confirmacion.component';
import { AuthService } from './servicios/auth.service';
import { ChatService } from './servicios/chat.service';

/** Páginas de cuenta con diseño propio a pantalla completa (sin navbar ni footer). */
const RUTAS_PANTALLA_COMPLETA = ['/login', '/registro', '/activar', '/recuperar', '/cambiar-contrasena', '/reactivar'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [NavbarComponent, FooterComponent, RouterOutlet, AccesibilidadComponent, ChatFlotanteComponent, ToastsComponent, ConfirmacionComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Asesorías Edén';
  /** El chat solo está disponible para cuentas ACTIVAS (SecurityConfig: /api/chat/**). */
  chatDisponible = false;
  pantallaCompleta = false;
  private subs: Subscription[] = [];

  constructor(private authService: AuthService, private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.sesion$.subscribe(sesion => {
        this.chatDisponible = sesion?.estado === 'ACTIVO';
        if (this.chatDisponible) {
          this.chatService.conectarWebSocket();
        } else {
          this.chatService.desconectarWebSocket();
        }
      })
    );
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
        const url = (e as NavigationEnd).urlAfterRedirects.split('?')[0];
        this.pantallaCompleta = RUTAS_PANTALLA_COMPLETA.some(r => url === r || url.startsWith(r + '/'));
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
