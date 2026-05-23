export interface EstadoProyecto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ProyectoRequest {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  presupuestoTotal: number;
}

export interface ProyectoResponse {
  id: number;
  estadoProyecto: EstadoProyecto;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  presupuestoTotal: number;
  fechaCreacion: string;
  fechaModificacion: string;
}
