import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { FooterComponent } from './componentes/footer/footer.component';
import { AccesibilidadComponent } from './componentes/accesibilidad/accesibilidad.component';
import { ChatFlotanteComponent } from './componentes/chat-flotante/chat-flotante.component';
import { ToastsComponent } from './componentes/toasts/toasts.component';
import { AuthService } from './servicios/auth.service';
import { ChatService } from './servicios/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [NavbarComponent, FooterComponent, RouterOutlet, AccesibilidadComponent, ChatFlotanteComponent, ToastsComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Asesorías Edén';
  /** El chat solo está disponible para cuentas ACTIVAS (SecurityConfig: /api/chat/**). */
  chatDisponible = false;
  private sub?: Subscription;

  constructor(private authService: AuthService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.sub = this.authService.sesion$.subscribe(sesion => {
      this.chatDisponible = sesion?.estado === 'ACTIVO';
      if (this.chatDisponible) {
        this.chatService.conectarWebSocket();
      } else {
        this.chatService.desconectarWebSocket();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
