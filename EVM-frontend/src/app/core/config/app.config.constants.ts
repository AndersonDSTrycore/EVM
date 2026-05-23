/**
 * Configuración global de la aplicación.
 * websocketEnabled: si está en false, no se conecta WebSocket ni se ejecutan suscripciones STOMP.
 * La aplicación funciona normalmente con REST.
 */
export const APP_CONFIG = {
  websocketEnabled: true,
} as const;
