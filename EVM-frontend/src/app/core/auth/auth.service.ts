import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UsuarioSesion } from '../models/auth.models';

const TOKEN_KEY = 'evm_token';
const USUARIO_KEY = 'evm_usuario';
const API_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, request).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  obtenerUsuario(): UsuarioSesion | null {
    const datos = localStorage.getItem(USUARIO_KEY);
    return datos ? JSON.parse(datos) : null;
  }

  tieneSesion(): boolean {
    return !!this.obtenerToken();
  }
}
