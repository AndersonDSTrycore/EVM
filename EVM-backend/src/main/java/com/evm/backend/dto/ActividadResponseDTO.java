package com.evm.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActividadResponseDTO {

    private Long id;
    private Long idProyecto;
    private String nombreProyecto;
    private EstadoCatalogoResponseDTO estadoActividad;
    private String nombre;
    private String descripcion;
    private BigDecimal bac;
    private BigDecimal porcentajeAvancePlanificado;
    private BigDecimal porcentajeAvanceReal;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
