import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IndicadoresEvmProyectoResponse, IndicadoresEvmActividadResponse } from '../models/indicador-evm.models';

const API_URL = 'http://localhost:8082/api';

@Injectable({ providedIn: 'root' })
export class IndicadorEvmService {
  private http = inject(HttpClient);

  obtenerIndicadoresProyecto(idProyecto: number, filtro?: string): Observable<IndicadoresEvmProyectoResponse> {
    let params = new HttpParams();
    if (filtro && filtro.trim()) {
      params = params.set('filtro', filtro.trim());
    }
    return this.http.get<IndicadoresEvmProyectoResponse>(
      `${API_URL}/proyectos/${idProyecto}/indicadores`,
      { params }
    );
  }

  obtenerIndicadoresActividad(idActividad: number): Observable<IndicadoresEvmActividadResponse> {
    return this.http.get<IndicadoresEvmActividadResponse>(
      `${API_URL}/actividades/${idActividad}/indicadores`
    );
  }
}
