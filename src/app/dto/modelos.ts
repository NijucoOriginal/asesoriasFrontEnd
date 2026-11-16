// Modelos que reflejan los DTOs del backend (rama Cambio de asesoriasEden).
// Las fechas LocalDateTime llegan como string ISO sin zona: "2026-11-20T15:00:00".

export type Rol = 'ESTUDIANTE' | 'MODERADOR';
export type EstadoUsuario = 'ACTIVO' | 'PENDIENTE' | 'INACTIVO';

export type EstadoAsesoria =
  | 'PENDIENTE'
  | 'CONTRAPROPUESTA'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'CANCELADA'
  | 'EXPIRADA'
  | 'FINALIZADA';

export type MotivoContrapropuesta = 'PRECIO' | 'FECHA';

/** AuthResponse: en éxito trae el JWT; en error el backend pone el mensaje en "token". */
export interface TokenResponse {
  token: string;
}

/** Claims que genera JwtService.generateToken */
export interface TokenClaims {
  sub: string; // email
  id: number;
  rol: Rol;
  nombre: string;
  apellido: string;
  telefono: string;
  documentoIdentidad: string;
  estado: EstadoUsuario;
  exp: number;
  iat: number;
}

/** CrearUsuarioDto */
export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  telefono: string;
  email: string;
  contrasena: string;
  recaptchaToken: string;
}

/** UserResponse */
export interface UserResponse {
  id: number;
  email: string;
  rol: Rol;
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  telefono: string;
}

/** PerfilResponse (GET /api/usuarios/me) */
export interface PerfilResponse {
  id: number;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  telefono: string;
  imagenPerfil: string | null;
}

/** TutorResponse (GET /api/tutores) */
export interface TutorResponse {
  id: number;
  nombre: string;
  apellido: string;
  carrera: string | null;
  imagenPerfil: string | null;
  materias: string[];
  horasTutoria: number;
  calificacionPromedio: number | null;
  totalResenas: number;
}

/** Materia que dicta un tutor con sus temas (GET /api/tutores/{id}/materias). */
export interface MateriaTutor {
  id: number;
  nombre: string;
  temas: { id: number; nombre: string }[];
}

export interface UsuarioResumen {
  id: number;
  nombre: string;
  apellido: string;
}

/** AsesoriaResponse */
export interface AsesoriaResponse {
  id: number;
  estado: EstadoAsesoria;
  motivoContrapropuesta: MotivoContrapropuesta | null;
  asesor: UsuarioResumen;
  participante: UsuarioResumen;
  materiaId: number;
  materiaNombre: string;
  temas: string[];
  fechaInicioPropuesta: string;
  fechaCierrePropuesta: string;
  fechaInicioConfirmada: string | null;
  fechaCierreConfirmada: string | null;
  precio: number;
  comision: number | null;
  creadaEn: string;
  actualizadaEn: string;
  aceptadaEn: string | null;
  rechazadaPorId: number | null;
  canceladaPorId: number | null;
}

/** CrearAsesoriaRequest */
export interface CrearAsesoriaRequest {
  asesorId: number;
  materiaId: number;
  temasIds: number[];
  fechaInicioPropuesta: string;
  fechaCierrePropuesta: string;
  precio: number;
}

/** ProponerAsesoriaRequest */
export interface ProponerAsesoriaRequest {
  fechaInicioPropuesta: string;
  fechaCierrePropuesta: string;
  precio: number;
  motivo: MotivoContrapropuesta | null;
}

/** ResenaRequest */
export interface ResenaRequest {
  calificacion: number;
  descripcion: string;
}

/** ResenaResponse */
export interface ResenaResponse {
  id: number;
  asesoriaId: number;
  materia: string;
  autorNombre: string;
  calificacion: number;
  descripcion: string | null;
}

export const ESTADO_ASESORIA_LABEL: Record<EstadoAsesoria, string> = {
  PENDIENTE: 'Pendiente',
  CONTRAPROPUESTA: 'Contrapropuesta',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
  FINALIZADA: 'Finalizada',
};
