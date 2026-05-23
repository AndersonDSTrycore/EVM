import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

const EvmPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e0f5f4',
      100: '#b3e6e4',
      200: '#80d5d3',
      300: '#4dc4c1',
      400: '#26b8b4',
      500: '#00a09a',
      600: '#008e89',
      700: '#007a75',
      800: '#006661',
      900: '#004d49',
      950: '#003330',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: EvmPreset,
        options: { darkModeSelector: false },
      },
    }),
  ],
};
