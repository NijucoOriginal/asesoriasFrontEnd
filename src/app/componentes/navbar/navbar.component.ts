import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { TokenClaims } from '../../dto/modelos';

/** Barra superior única de la app; cambia según haya sesión y el estado de la cuenta. */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  sesion: TokenClaims | null = null;
  noLeidos = 0;
  menuAbierto = false;
  ocultar = false;
  private subs: Subscription[] = [];

  /** Páginas con diseño propio a pantalla completa. */
  private readonly rutasSinNavbar = ['/login', '/registro', '/activar', '/recuperar', '/cambiar-contrasena'];

  constructor(private auth: AuthService, private chat: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.subs.push(this.auth.sesion$.subscribe(s => (this.sesion = s)));
    this.subs.push(this.chat.totalNoLeidos$.subscribe(n => (this.noLeidos = n)));
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
        const url = (e as NavigationEnd).urlAfterRedirects.split('?')[0];
        this.ocultar = this.rutasSinNavbar.some(r => url === r || url.startsWith(r + '/'));
        this.menuAbierto = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get activo(): boolean {
    return this.sesion?.estado === 'ACTIVO';
  }

  get iniciales(): string {
    const n = this.sesion?.nombre?.[0] ?? '';
    const a = this.sesion?.apellido?.[0] ?? '';
    return (n + a).toUpperCase() || '?';
  }

  abrirChat(): void {
    this.chat.togglePanel();
  }

  cerrarSesion(): void {
    this.chat.desconectarWebSocket();
    this.auth.logout();
  }
}
