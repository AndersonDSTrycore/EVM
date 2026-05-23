import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { WebSocketService } from '../../../core/services/web-socket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { APP_CONFIG } from '../../../core/config/app.config.constants';
import { inject } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);

  sidebarColapsado = false;
  tituloModulo = 'EVM System';

  ngOnInit(): void {
    // Conectar WebSocket solo si está habilitado y el usuario tiene sesión activa.
    if (APP_CONFIG.websocketEnabled && this.authService.tieneSesion()) {
      try {
        this.webSocketService.conectar();
      } catch (err) {
        console.warn('[WS] Error al iniciar WebSocket desde main-layout:', err);
      }
    }
  }

  ngOnDestroy(): void {
    // No desconectar aquí: el logout se encarga de eso.
  }
}
