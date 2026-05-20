package com.evm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActividadRequestDTO {

    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal bac;

    @NotNull
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00")
    private BigDecimal porcentajeAvancePlanificado;

    @NotNull
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00")
    private BigDecimal porcentajeAvanceReal;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;
}
