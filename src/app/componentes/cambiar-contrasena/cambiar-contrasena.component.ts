import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import { mensajeError } from '../../servicios/api-error';
import { AuthAsideComponent } from '../auth-aside/auth-aside.component';
import { CodigoInputComponent } from '../codigo-input/codigo-input.component';

/** Paso 2 de la recuperación: código + contraseña nueva (POST /api/auth/recuperar/cambiar). */
@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, NgClass, AuthAsideComponent, CodigoInputComponent],
  templateUrl: './cambiar-contrasena.component.html',
})
export class CambiarContrasenaComponent implements OnInit {
  form!: FormGroup;
  email = '';
  isSubmitting = false;
  exito = false;
  error = '';
  verContra = false;
  verConfirmContra = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('recoveryEmail') ?? '';
    this.form = this.fb.group(
      {
        codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        nuevaContrasena: [
          '',
          [Validators.required, Validators.maxLength(100), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)],
        ],
        confirmarContrasena: ['', Validators.required],
      },
      { validators: (f: AbstractControl) => (f.get('nuevaContrasena')?.value === f.get('confirmarContrasena')?.value ? null : { passwordsMismatch: true }) }
    );
  }

  get requisitos(): { texto: string; ok: boolean }[] {
    const v: string = this.form.get('nuevaContrasena')?.value ?? '';
    return [
      { texto: 'Mínimo 8 caracteres', ok: v.length >= 8 },
      { texto: 'Una mayúscula', ok: /[A-Z]/.test(v) },
      { texto: 'Una minúscula', ok: /[a-z]/.test(v) },
      { texto: 'Un número', ok: /\d/.test(v) },
      { texto: 'Un símbolo', ok: /[^a-zA-Z0-9]/.test(v) },
    ];
  }

  setCodigo(codigo: string): void {
    this.form.get('codigo')?.setValue(codigo);
    this.form.get('codigo')?.markAsTouched();
    this.error = '';
  }

  cambiarContrasena(): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.error = 'Escribe el correo al que llegó el código.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = this.form.get('codigo')?.invalid ? 'Ingresa los 6 caracteres del código.' : '';
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    const { codigo, nuevaContrasena } = this.form.value;
    this.authService.cambiarContrasenaConCodigo(this.email.trim(), codigo, nuevaContrasena).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.exito = true;
        localStorage.removeItem('recoveryEmail');
        setTimeout(() => this.router.navigate(['/login']), 2200);
      },
      error: err => {
        this.isSubmitting = false;
        this.error = mensajeError(err, 'Código inválido o expirado.');
      },
    });
  }
}
