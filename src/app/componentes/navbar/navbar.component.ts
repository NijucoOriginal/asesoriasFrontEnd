import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { ChatService } from '../../servicios/chat.service';
import { UsersService } from '../../servicios/users.service';
import { TokenClaims } from '../../dto/modelos';

/** Barra superior única de la app; cambia según haya sesión y el estado de la cuenta. */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  sesion: TokenClaims | null = null;
  foto: string | null = null;
  noLeidos = 0;
  menuAbierto = false;
  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private users: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.auth.sesion$.subscribe(s => {
        const cambioUsuario = s?.id !== this.sesion?.id;
        this.sesion = s;
        if (!s) this.foto = null;
        else if (cambioUsuario) this.cargarFoto();
      })
    );
    this.subs.push(this.chat.totalNoLeidos$.subscribe(n => (this.noLeidos = n)));
    this.subs.push(this.users.fotoPerfil$.subscribe(url => (this.foto = url)));
    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => (this.menuAbierto = false))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private cargarFoto(): void {
    this.users.miPerfil().subscribe({ next: p => (this.foto = p.imagenPerfil), error: () => {} });
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
