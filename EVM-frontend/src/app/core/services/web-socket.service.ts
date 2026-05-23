import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable, EMPTY } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.constants';

export interface EventoWebSocket {
  tipoEvento: string;
  idProyecto: number | null;
  idActividad: number | null;
  idAsignacion: number | null;
  idRegistroHoras: number | null;
  mensaje: string;
  fechaHora: string;
  requiereRefresco: boolean;
}

const WS_URL = 'http://localhost:8082/ws';
const TOKEN_KEY = 'evm_token';

/**
 * Servicio WebSocket con STOMP/SockJS.
 * - No se conecta en el constructor.
 * - Respeta la bandera APP_CONFIG.websocketEnabled.
 * - Lee el token directamente de localStorage (evita dependencia circular con AuthService).
 * - Reconecta automáticamente si se pierde conexión.
 * - No bloquea la aplicación si falla.
 * - Se desconecta en logout.
 * - Expone eventos como Observables.
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private suscripciones = new Map<string, StompSubscription>();
  private conectado = false;

  /** Conecta WebSocket usando el token JWT del storage. No lanzar antes de login. */
  async conectar(): Promise<void> {
    if (!APP_CONFIG.websocketEnabled) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.warn('[WS] No hay token JWT, conexión WebSocket omitida.');
      return;
    }

    if (this.conectado || (this.client && this.client.active)) {
      return;
    }

    try {
      // Importar SockJS de forma dinámica para evitar errores de polyfill en esbuild
      const SockJS = (await import('sockjs-client')).default;

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        onConnect: () => {
          this.conectado = true;
          console.log('[WS] Conexión WebSocket establecida.');
        },
        onDisconnect: () => {
          this.conectado = false;
          console.log('[WS] Conexión WebSocket cerrada.');
        },
        onStompError: (frame) => {
          this.conectado = false;
          console.warn('[WS] Error STOMP:', frame.headers?.['message'] ?? frame);
        },
        onWebSocketError: (evt) => {
          this.conectado = false;
          console.warn('[WS] Error WebSocket:', evt);
        },
      });

      this.client.activate();
    } catch (err) {
      console.warn('[WS] No se pudo activar WebSocket:', err);
    }
  }

  /** Desconecta y limpia todas las suscripciones. Llamar en logout. */
  desconectar(): void {
    this.cancelarTodasSuscripciones();
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.warn('[WS] Error al desconectar WebSocket:', err);
      }
      this.client = null;
    }
    this.conectado = false;
  }

  /**
   * Suscribe a un canal STOMP.
   * Si WebSocket está deshabilitado o no conectado, retorna un Observable vacío (no bloquea).
   * @param canal  Destino STOMP, p.ej. '/topic/proyectos'
   * @param clave  Clave única para gestionar la suscripción y cancelarla después
   * @returns Observable<EventoWebSocket>
   */
  suscribir(canal: string, clave: string): Observable<EventoWebSocket> {
    if (!APP_CONFIG.websocketEnabled) {
      return EMPTY;
    }

    const subject = new Subject<EventoWebSocket>();

    const intentarSuscripcion = (intentos = 0) => {
      if (!APP_CONFIG.websocketEnabled) {
        return;
      }
      if (!this.client || !this.client.active || !this.client.connected) {
        if (intentos < 10) {
          setTimeout(() => intentarSuscripcion(intentos + 1), 500);
        } else {
          console.warn('[WS] No se pudo suscribir a', canal, '- conexión no disponible.');
        }
        return;
      }
      if (this.suscripciones.has(clave)) {
        return;
      }
      try {
        const sub = this.client.subscribe(canal, (msg: IMessage) => {
          try {
            const evento: EventoWebSocket = JSON.parse(msg.body);
            subject.next(evento);
          } catch (e) {
            console.warn('[WS] Error al parsear mensaje:', e);
          }
        });
        this.suscripciones.set(clave, sub);
      } catch (err) {
        console.warn('[WS] Error al suscribir canal', canal, err);
      }
    };

    intentarSuscripcion();
    return subject.asObservable();
  }

  /** Cancela una suscripción por su clave. */
  cancelarSuscripcion(clave: string): void {
    const sub = this.suscripciones.get(clave);
    if (sub) {
      try {
        sub.unsubscribe();
      } catch (err) {
        console.warn('[WS] Error al cancelar suscripción', clave, err);
      }
      this.suscripciones.delete(clave);
    }
  }

  /** Cancela todas las suscripciones activas. */
  cancelarTodasSuscripciones(): void {
    this.suscripciones.forEach((sub, clave) => {
      try {
        sub.unsubscribe();
      } catch (err) {
        console.warn('[WS] Error al cancelar suscripción', clave, err);
      }
    });
    this.suscripciones.clear();
  }

  estaConectado(): boolean {
    return this.conectado && APP_CONFIG.websocketEnabled;
  }
}
