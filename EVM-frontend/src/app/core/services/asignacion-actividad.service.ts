import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AsignacionActividadRequest,
  AsignacionActividadResponse,
  UsuarioDisponibleResponse,
} from '../models/asignacion.models';

const API_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AsignacionActividadService {
  private http = inject(HttpClient);

  listarPorActividad(idActividad: number): Observable<AsignacionActividadResponse[]> {
    return this.http.get<AsignacionActividadResponse[]>(
      `${API_URL}/actividades/${idActividad}/asignaciones`
    );
  }

  listarUsuariosDisponibles(idActividad: number): Observable<UsuarioDisponibleResponse[]> {
    return this.http.get<UsuarioDisponibleResponse[]>(
      `${API_URL}/actividades/${idActividad}/usuarios-disponibles`
    );
  }

  asignar(
    idActividad: number,
    dto: AsignacionActividadRequest
  ): Observable<AsignacionActividadResponse[]> {
    return this.http.post<AsignacionActividadResponse[]>(
      `${API_URL}/actividades/${idActividad}/asignaciones`,
      dto
    );
  }

  retirar(idAsignacion: number): Observable<AsignacionActividadResponse> {
    return this.http.patch<AsignacionActividadResponse>(
      `${API_URL}/asignaciones/${idAsignacion}/retirar`,
      {}
    );
  }
}
