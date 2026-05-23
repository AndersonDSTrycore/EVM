package com.evm.backend.config;

import com.evm.backend.security.JwtService;
import com.evm.backend.security.UsuarioDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Interceptor de canal WebSocket que valida el token JWT en el momento
 * del handshake STOMP (comando CONNECT).
 * Si el token es inválido o ausente, lanza excepción y rechaza la conexión.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Conexión WebSocket rechazada: token JWT ausente o mal formado");
                throw new org.springframework.security.access.AccessDeniedException(
                        "Token JWT requerido para conexión WebSocket");
            }

            String token = authHeader.substring(7);
            try {
                String correo = jwtService.extraerCorreo(token);
                UserDetails userDetails = usuarioDetailsService.loadUserByUsername(correo);
                if (jwtService.esTokenValido(token, userDetails)) {
                    UsernamePasswordAuthenticationToken autenticacion =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(autenticacion);
                    log.debug("Conexión WebSocket autenticada para usuario: {}", correo);
                } else {
                    log.warn("Conexión WebSocket rechazada: token JWT inválido para correo={}", correo);
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Token JWT inválido");
                }
            } catch (org.springframework.security.access.AccessDeniedException ex) {
                throw ex;
            } catch (Exception ex) {
                log.warn("Conexión WebSocket rechazada: error al validar JWT - {}", ex.getMessage());
                throw new org.springframework.security.access.AccessDeniedException(
                        "Error al validar token JWT: " + ex.getMessage());
            }
        }

        return message;
    }
}
