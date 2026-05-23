package com.evm.backend.service;

import com.evm.backend.dto.EventoWebSocketDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Servicio de publicación de eventos WebSocket.
 * Responsabilidades:
 * - Publicar eventos livianos en los canales STOMP.
 * - No contiene lógica de negocio ni cálculos EVM.
 * - No persiste eventos.
 * El frontend, al recibir un evento, refresca los datos vía REST.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventoService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Publica un evento de proyecto en /topic/proyectos.
     */
    public void publicarEventoProyecto(String tipoEvento, Long idProyecto, String mensaje) {
        EventoWebSocketDTO evento = EventoWebSocketDTO.builder()
                .tipoEvento(tipoEvento)
                .idProyecto(idProyecto)
                .mensaje(mensaje)
                .fechaHora(LocalDateTime.now())
                .requiereRefresco(true)
                .build();
        try {
            messagingTemplate.convertAndSend("/topic/proyectos", evento);
            log.info("Evento WebSocket publicado en /topic/proyectos tipoEvento={} idProyecto={}", tipoEvento, idProyecto);
        } catch (Exception ex) {
            log.error("Error al publicar evento WebSocket en /topic/proyectos: {}", ex.getMessage());
        }
    }

    /**
     * Publica un evento de actividad en /topic/proyectos/{idProyecto}/actividades.
     */
    public void publicarEventoActividad(String tipoEvento, Long idProyecto, Long idActividad, String mensaje) {
        EventoWebSocketDTO evento = EventoWebSocketDTO.builder()
                .tipoEvento(tipoEvento)
                .idProyecto(idProyecto)
                .idActividad(idActividad)
                .mensaje(mensaje)
                .fechaHora(LocalDateTime.now())
                .requiereRefresco(true)
                .build();
        String destino = "/topic/proyectos/" + idProyecto + "/actividades";
        try {
            messagingTemplate.convertAndSend(destino, evento);
            log.info("Evento WebSocket publicado en {} tipoEvento={} idActividad={}", destino, tipoEvento, idActividad);
        } catch (Exception ex) {
            log.error("Error al publicar evento WebSocket en {}: {}", destino, ex.getMessage());
        }
    }

    /**
     * Publica un evento de asignación en /topic/actividades/{idActividad}/asignaciones.
     */
    public void publicarEventoAsignacion(String tipoEvento, Long idActividad, Long idAsignacion, String mensaje) {
        EventoWebSocketDTO evento = EventoWebSocketDTO.builder()
                .tipoEvento(tipoEvento)
                .idActividad(idActividad)
                .idAsignacion(idAsignacion)
                .mensaje(mensaje)
                .fechaHora(LocalDateTime.now())
                .requiereRefresco(true)
                .build();
        String destino = "/topic/actividades/" + idActividad + "/asignaciones";
        try {
            messagingTemplate.convertAndSend(destino, evento);
            log.info("Evento WebSocket publicado en {} tipoEvento={} idAsignacion={}", destino, tipoEvento, idAsignacion);
        } catch (Exception ex) {
            log.error("Error al publicar evento WebSocket en {}: {}", destino, ex.getMessage());
        }
    }

    /**
     * Publica un evento de registro de horas en /topic/actividades/{idActividad}/registros-horas
     * y en /topic/proyectos/{idProyecto}/indicadores.
     */
    public void publicarEventoRegistroHoras(String tipoEvento, Long idProyecto, Long idActividad,
                                             Long idRegistroHoras, String mensaje) {
        EventoWebSocketDTO eventoHoras = EventoWebSocketDTO.builder()
                .tipoEvento(tipoEvento)
                .idProyecto(idProyecto)
                .idActividad(idActividad)
                .idRegistroHoras(idRegistroHoras)
                .mensaje(mensaje)
                .fechaHora(LocalDateTime.now())
                .requiereRefresco(true)
                .build();
        String destinoHoras = "/topic/actividades/" + idActividad + "/registros-horas";
        try {
            messagingTemplate.convertAndSend(destinoHoras, eventoHoras);
            log.info("Evento WebSocket publicado en {} tipoEvento={} idRegistroHoras={}",
                    destinoHoras, tipoEvento, idRegistroHoras);
        } catch (Exception ex) {
            log.error("Error al publicar evento WebSocket en {}: {}", destinoHoras, ex.getMessage());
        }

        // También notificar indicadores del proyecto
        publicarEventoIndicadores(idProyecto, idActividad, "Indicadores recalculados por nuevo registro de horas.");
    }

    /**
     * Publica un evento de indicadores en /topic/proyectos/{idProyecto}/indicadores.
     */
    public void publicarEventoIndicadores(Long idProyecto, Long idActividad, String mensaje) {
        EventoWebSocketDTO evento = EventoWebSocketDTO.builder()
                .tipoEvento("INDICADORES_RECALCULADOS")
                .idProyecto(idProyecto)
                .idActividad(idActividad)
                .mensaje(mensaje)
                .fechaHora(LocalDateTime.now())
                .requiereRefresco(true)
                .build();
        String destino = "/topic/proyectos/" + idProyecto + "/indicadores";
        try {
            messagingTemplate.convertAndSend(destino, evento);
            log.info("Evento WebSocket publicado en {} idProyecto={}", destino, idProyecto);
        } catch (Exception ex) {
            log.error("Error al publicar evento WebSocket en {}: {}", destino, ex.getMessage());
        }
    }
}
