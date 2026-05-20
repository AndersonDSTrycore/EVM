export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  tipo_token: string;
  usuario: UsuarioSesion;
}
