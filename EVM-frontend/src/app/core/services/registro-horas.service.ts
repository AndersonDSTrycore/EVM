import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroHorasRequest, RegistroHorasResponse } from '../models/registro-horas.models';

const API_URL = 'http://localhost:8082/api';

@Injectable({ providedIn: 'root' })
export class RegistroHorasService {
  private http = inject(HttpClient);

  listarPorActividad(idActividad: number): Observable<RegistroHorasResponse[]> {
    return this.http.get<RegistroHorasResponse[]>(
      `${API_URL}/actividades/${idActividad}/registros-horas`
    );
  }

  registrar(idActividad: number, dto: RegistroHorasRequest): Observable<RegistroHorasResponse> {
    return this.http.post<RegistroHorasResponse>(
      `${API_URL}/actividades/${idActividad}/registros-horas`,
      dto
    );
  }
}
