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
public class RegistroHorasResponseDTO {

    private Long id;
    private Long idActividad;
    private String nombreActividad;
    private Long idUsuario;
    private String nombreUsuario;
    private String correoUsuario;
    private String cargoUsuario;
    private Long idUsuarioRegistra;
    private String nombreUsuarioRegistra;
    private LocalDate fechaTrabajo;
    private BigDecimal horasTrabajadas;
    private BigDecimal valorHoraHistorico;
    private BigDecimal costoTotal;
    private String descripcion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
