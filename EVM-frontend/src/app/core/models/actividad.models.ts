export interface EstadoActividad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ActividadRequest {
  nombre: string;
  descripcion?: string;
  bac: number;
  porcentajeAvancePlanificado: number;
  porcentajeAvanceReal: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface ActividadResponse {
  id: number;
  idProyecto: number;
  nombreProyecto: string;
  estadoActividad: EstadoActividad;
  nombre: string;
  descripcion?: string;
  bac: number;
  porcentajeAvancePlanificado: number;
  porcentajeAvanceReal: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
  fechaModificacion: string;
}
