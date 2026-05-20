import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  @Input() tituloModulo = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);

  get nombreUsuario(): string {
    return this.authService.obtenerUsuario()?.nombre ?? '';
  }

  get rolUsuario(): string {
    return this.authService.obtenerUsuario()?.rol ?? '';
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
