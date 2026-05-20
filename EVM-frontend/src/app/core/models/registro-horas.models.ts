export interface RegistroHorasRequest {
  idUsuario: number;
  fechaTrabajo: string;
  horasTrabajadas: number;
  descripcion?: string;
}

export interface RegistroHorasResponse {
  id: number;
  idActividad: number;
  nombreActividad: string;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  cargoUsuario: string;
  idUsuarioRegistra: number;
  nombreUsuarioRegistra: string;
  fechaTrabajo: string;
  horasTrabajadas: number;
  valorHoraHistorico: number;
  costoTotal: number;
  descripcion?: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ResumenRegistroHoras {
  totalHoras: number;
  totalCosto: number;
}
