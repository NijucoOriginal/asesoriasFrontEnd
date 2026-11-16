import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de cualquier error del backend.
 * El backend responde de varias formas según el endpoint:
 *  - texto plano ("Código inválido o expirado.")
 *  - { message } / { error, message }   (UserController, CuentaController, GlobalExceptionHandler)
 *  - { token: "mensaje" }               (AuthController.login cuando falla)
 *  - { errorMessage }                   (ErrorsResponseDto)
 *  - mapa de validaciones { campo: "mensaje" }
 */
export function mensajeError(err: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (!(err instanceof HttpErrorResponse)) {
    return typeof err === 'string' && err ? err : porDefecto;
  }
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
  }
  let body: any = err.error;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return body.trim() || porDefecto;
    }
  }
  if (body && typeof body === 'object') {
    const msg = body.message ?? body.errorMessage ?? body.mensaje ?? body.token ?? body.error;
    if (typeof msg === 'string' && msg) return msg;
    const valores = Object.values(body).filter(v => typeof v === 'string') as string[];
    if (valores.length) return valores.join(' ');
  }
  if (err.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (err.status === 404) return 'El recurso solicitado no existe.';
  return porDefecto;
}
