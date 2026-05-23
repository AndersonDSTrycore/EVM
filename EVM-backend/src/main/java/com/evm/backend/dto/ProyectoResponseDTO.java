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
public class ProyectoResponseDTO {

    private Long id;
    private EstadoCatalogoResponseDTO estadoProyecto;
    private String nombre;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal presupuestoTotal;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
