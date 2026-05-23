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
public class ProyectoRequestDTO {

    @NotBlank(message = "El nombre del proyecto es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotNull(message = "El presupuesto total es obligatorio")
    @DecimalMin(value = "0.00", message = "El presupuesto total debe ser mayor o igual a cero")
    private BigDecimal presupuestoTotal;
}
