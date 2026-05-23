import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const RUTAS_PUBLICAS = ['/api/auth/login'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const esPublica = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));

  if (esPublica) {
    return next(req);
  }

  const token = authService.obtenerToken();
  if (token) {
    const reqAutenticado = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqAutenticado);
  }

  return next(req);
};
