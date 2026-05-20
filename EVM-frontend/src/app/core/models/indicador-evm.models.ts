export type EstadoEvm = 'BIEN' | 'RIESGO' | 'CRITICO' | 'SIN_DATOS';

export interface IndicadorEvmActividadDetalle {
  idActividad: number;
  nombreActividad: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  estadoCosto: EstadoEvm;
  estadoCronograma: EstadoEvm;
  interpretacionCosto: string;
  interpretacionCronograma: string;
}

export interface IndicadoresEvmProyectoResponse {
  idProyecto: number;
  nombreProyecto: string;
  filtroAplicado: string | null;
  cantidadActividades: number;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  vac: number | null;
  estadoCosto: EstadoEvm;
  estadoCronograma: EstadoEvm;
  interpretacionCosto: string;
  interpretacionCronograma: string;
  actividades: IndicadorEvmActividadDetalle[];
}

export interface IndicadoresEvmActividadResponse {
  idActividad: number;
  nombreActividad: string;
  idProyecto: number;
  nombreProyecto: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cv: number;
  sv: number;
  cpi: number | null;
  spi: number | null;
  eac: number | null;
  vac: number | null;
  estadoCosto: EstadoEvm;
  estadoCronograma: EstadoEvm;
  interpretacionCosto: string;
  interpretacionCronograma: string;
}
