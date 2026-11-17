import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { IdiomaService } from '../../servicios/idioma.service';
import { environment } from '../../../environments/environment';
import { ES } from '../../i18n/es';

/** Formulario de contacto (POST /api/auth/contacto, mismas reglas que ContactoDto). */
@Component({
  selector: 'app-contactenos',
  standalone: true,
  templateUrl: './contactenos.component.html',
  styleUrls: ['./contactenos.component.css'],
  imports: [ReactiveFormsModule, RecaptchaModule],
  providers: [{ provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.recaptcha.siteKey } as RecaptchaSettings }],
})
export class ContactenosComponent implements OnInit, OnDestroy {
  contactoForm: FormGroup;
  captchaToken: string | null = null;
  captchaActivo = true;
  enviando = false;
  enviado = false;
  intento = false;
  t: typeof ES;
  private sub!: Subscription;
  private observer: MutationObserver | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public idiomaService: IdiomaService
  ) {
    this.t = idiomaService.t;
    const sesion = this.authService.getClaims();
    this.contactoForm = this.fb.group({
      nombre: [sesion ? `${sesion.nombre} ${sesion.apellido}` : '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      telefono: [sesion?.telefono?.replace(/\D/g, '').slice(-10) ?? '', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      correo: [sesion?.sub ?? '', [Validators.required, Validators.email]],
      asunto: ['', [Validators.required, Validators.maxLength(150)]],
      mensaje: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => (this.t = t));
    // El captcha cambia de tema cuando se activa/desactiva el modo oscuro
    this.observer = new MutationObserver(() => this.recargarCaptcha());
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.observer?.disconnect();
  }

  recargarCaptcha(): void {
    this.captchaActivo = false;
    this.captchaToken = null;
    this.cdr.detectChanges();
    this.captchaActivo = true;
    this.cdr.detectChanges();
  }

  get temaActual(): 'light' | 'dark' {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  get largoMensaje(): number {
    return (this.contactoForm.get('mensaje')?.value ?? '').length;
  }

  invalido(campo: string): boolean {
    const c = this.contactoForm.get(campo);
    return !!c && c.invalid && (c.touched || this.intento);
  }

  resolved(token: string | null): void {
    this.captchaToken = token;
  }

  onSubmit(): void {
    this.intento = true;
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }
    if (!this.captchaToken) return;
    this.enviando = true;
    this.authService.enviarContacto({ ...this.contactoForm.value, recaptchaToken: this.captchaToken }).subscribe({
      next: () => {
        this.enviando = false;
        this.enviado = true;
        this.intento = false;
        this.contactoForm.patchValue({ asunto: '', mensaje: '' });
        this.contactoForm.markAsUntouched();
        this.recargarCaptcha();
      },
      error: () => {
        this.enviando = false;
        this.recargarCaptcha();
      },
    });
  }
}
