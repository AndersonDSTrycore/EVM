package com.evm.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de evento WebSocket. Se envía como payload liviano para indicar qué cambió.
 * El frontend, al recibirlo, refresca los datos usando los endpoints REST existentes.
 * No contiene datos sensibles ni indicadores EVM derivados.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoWebSocketDTO {

    /** Tipo de evento ocurrido. Valores definidos en la enumeración TipoEventoWebSocket. */
    private String tipoEvento;

    /** Identificador del proyecto afectado. Puede ser null si no aplica. */
    private Long idProyecto;

    /** Identificador de la actividad afectada. Puede ser null si no aplica. */
    private Long idActividad;

    /** Identificador de la asignación afectada. Puede ser null si no aplica. */
    private Long idAsignacion;

    /** Identificador del registro de horas afectado. Puede ser null si no aplica. */
    private Long idRegistroHoras;

    /** Mensaje descriptivo del evento. */
    private String mensaje;

    /** Fecha y hora del evento. */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;

    /** Indica si el frontend debe refrescar datos al recibir este evento. */
    private boolean requiereRefresco;
}
