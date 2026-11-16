import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActivarCuentaService {
  private readonly baseUrl = `${environment.backendUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  /** GET /api/auth/activate/{codigo} — responde texto plano. */
  activateAccount(code: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/activate/${encodeURIComponent(code)}`, { responseType: 'text' });
  }

  /** POST /api/auth/resend-activation — responde texto plano (mismo mensaje exista o no el correo). */
  resendActivationCode(email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/resend-activation`, { email }, { responseType: 'text' });
  }
}
