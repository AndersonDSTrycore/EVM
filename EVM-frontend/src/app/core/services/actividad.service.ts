import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActividadRequest, ActividadResponse } from '../models/actividad.models';

const API_URL = 'http://localhost:8082/api';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private http = inject(HttpClient);

  listarPorProyecto(idProyecto: number): Observable<ActividadResponse[]> {
    return this.http.get<ActividadResponse[]>(`${API_URL}/proyectos/${idProyecto}/actividades`);
  }

  obtenerPorId(id: number): Observable<ActividadResponse> {
    return this.http.get<ActividadResponse>(`${API_URL}/actividades/${id}`);
  }

  crear(idProyecto: number, dto: ActividadRequest): Observable<ActividadResponse> {
    return this.http.post<ActividadResponse>(`${API_URL}/proyectos/${idProyecto}/actividades`, dto);
  }

  actualizar(id: number, dto: ActividadRequest): Observable<ActividadResponse> {
    return this.http.put<ActividadResponse>(`${API_URL}/actividades/${id}`, dto);
  }

  cancelar(id: number): Observable<ActividadResponse> {
    return this.http.patch<ActividadResponse>(`${API_URL}/actividades/${id}/cancelar`, {});
  }
}
