import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProyectoRequest, ProyectoResponse } from '../models/proyecto.models';

const API_URL = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private http = inject(HttpClient);

  listarTodos(): Observable<ProyectoResponse[]> {
    return this.http.get<ProyectoResponse[]>(`${API_URL}/proyectos`);
  }

  obtenerPorId(id: number): Observable<ProyectoResponse> {
    return this.http.get<ProyectoResponse>(`${API_URL}/proyectos/${id}`);
  }

  crear(dto: ProyectoRequest): Observable<ProyectoResponse> {
    return this.http.post<ProyectoResponse>(`${API_URL}/proyectos`, dto);
  }

  actualizar(id: number, dto: ProyectoRequest): Observable<ProyectoResponse> {
    return this.http.put<ProyectoResponse>(`${API_URL}/proyectos/${id}`, dto);
  }

  cancelar(id: number): Observable<ProyectoResponse> {
    return this.http.patch<ProyectoResponse>(`${API_URL}/proyectos/${id}/cancelar`, {});
  }
}
