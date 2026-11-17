import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsersService } from '../../servicios/users.service';
import { ProgramasService } from '../../servicios/programas.service';
import { RedireccionService } from '../../servicios/redireccion.service';
import { IdiomaService } from '../../servicios/idioma.service';
import { ES } from '../../i18n/es';
import { ErrorResponse, ProgramaCatalogo } from '../../dto/modelos';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink, NgClass, RecaptchaModule, FormsModule, NgForOf],
  providers: [
    { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.recaptcha.siteKey } as RecaptchaSettings },
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent implements OnInit, OnDestroy {
  registroForm!: FormGroup;
  result = '';
  classResult = 'success';
  verContra = false;
  verConfirmContra = false;
  cargando = false;

  programas: ProgramaCatalogo[] = [];

  captchaToken: string | null = null;
  captchaActivo = true;
  private observer: MutationObserver | null = null;

  t: typeof ES;
  private sub!: Subscription;

  prefijoTelefono = '+57';
  paises = [
    { codigo: '+57', nombre: '🇨🇴 Colombia' },
    { codigo: '+1', nombre: '🇺🇸 EE.UU / CA' },
    { codigo: '+52', nombre: '🇲🇽 México' },
    { codigo: '+34', nombre: '🇪🇸 España' },
    { codigo: '+54', nombre: '🇦🇷 Argentina' },
    { codigo: '+56', nombre: '🇨🇱 Chile' },
    { codigo: '+51', nombre: '🇵🇪 Perú' },
    { codigo: '+58', nombre: '🇻🇪 Venezuela' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private programasService: ProgramasService,
    private router: Router,
    protected redireccionamiento: RedireccionService,
    private cdr: ChangeDetectorRef,
    public idiomaService: IdiomaService
  ) {
    this.t = idiomaService.t;
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.sub = this.idiomaService.traducciones$.subscribe(t => (this.t = t));

    this.programasService.catalogo().subscribe({
      next: p => (this.programas = p),
      error: () => (this.result = 'No se pudo cargar la lista de carreras.'),
    });

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

  private crearFormulario(): void {
    this.registroForm = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(50)]],
        apellido: ['', [Validators.required, Validators.maxLength(50)]],
        documentoIdentidad: ['', [Validators.required, Validators.maxLength(20)]],
        telefono: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^\d+$/)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        programaId: [null, [Validators.required]],
        contrasena: [
          '',
          [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)],
        ],
        confirmcontrasena: ['', [Validators.required]],
        aceptaPolitica: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );

    const guardado = sessionStorage.getItem('registroFormData');
    if (guardado) this.registroForm.patchValue(JSON.parse(guardado));

    this.registroForm.valueChanges.subscribe(values => {
      const { contrasena, confirmcontrasena, ...resto } = values;
      sessionStorage.setItem('registroFormData', JSON.stringify(resto));
    });
  }

  onCaptchaResolved(token: string | null): void {
    this.captchaToken = token;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    if (!this.captchaToken) {
      this.result = this.t.login?.errorCaptcha || 'Por favor, completa la verificación (Captcha).';
      this.classResult = 'text-danger text-center fw-bold';
      return;
    }

    this.cargando = true;
    this.result = '';

    const v = this.registroForm.value;
    const newUser = {
      nombre: v.nombre,
      apellido: v.apellido,
      documentoIdentidad: v.documentoIdentidad,
      telefono: this.prefijoTelefono + v.telefono,
      email: v.email,
      contrasena: v.contrasena,
      programaId: Number(v.programaId),
      recaptchaToken: this.captchaToken,
    };

    this.usersService.registrar(newUser).subscribe({
      next: () => {
        this.cargando = false;
        sessionStorage.removeItem('registroFormData');
        this.result = 'Usuario registrado correctamente. Redirigiendo...';
        this.classResult = 'text-success text-center fw-bold';
        localStorage.setItem('pendingActivationEmail', v.email);
        setTimeout(() => this.router.navigate(['/activar'], { state: { email: v.email } }), 2000);
      },
      error: error => {
        this.cargando = false;
        this.recargarCaptcha();
        this.classResult = 'text-danger text-center fw-bold';
        if (error.error?.message) this.result = error.error.message;
        else if (Array.isArray(error.error)) this.result = error.error.map((i: ErrorResponse) => i.message).join(', ');
        else if (typeof error.error === 'string') this.result = error.error;
        else this.result = 'Error al registrar el usuario. El correo o cédula ya podrían estar en uso.';
        this.cdr.detectChanges();
      },
    });
  }

  passwordMatchValidator(group: FormGroup): any {
    return group.get('contrasena')?.value === group.get('confirmcontrasena')?.value ? null : { passwordsMismatch: true };
  }

  mostrarContrasenia(): void {
    this.verContra = !this.verContra;
  }

  mostrarConfirmContrasenia(): void {
    this.verConfirmContra = !this.verConfirmContra;
  }

  redirigirPoliticaDatosConLocalStorage(): void {
    localStorage.setItem('migaPan', 'registro');
    this.redireccionamiento.redirigirAPoliticaDatos();
  }

  get temaActual(): 'light' | 'dark' {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    return charCode >= 48 && charCode <= 57;
  }
}
