export interface AsignacionActividadRequest {
  idsUsuarios: number[];
}

export interface EstadoAsignacion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface AsignacionActividadResponse {
  id: number;
  idActividad: number;
  nombreActividad: string;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  cargoUsuario: string;
  estadoAsignacion: EstadoAsignacion;
  fechaAsignacion: string;
  fechaRetiro: string | null;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface UsuarioDisponibleResponse {
  id: number;
  nombre: string;
  correo: string;
  cargo: string;
  rol: string;
}
