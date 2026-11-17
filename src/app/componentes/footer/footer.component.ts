import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdiomaService } from '../../servicios/idioma.service';
import { ES } from '../../i18n/es';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  t: typeof ES;
  private sub!: Subscription;

  constructor(public idiomaService: IdiomaService) {
    this.t = idiomaService.t;
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => (this.t = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
