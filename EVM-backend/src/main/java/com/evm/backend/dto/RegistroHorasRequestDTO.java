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
public class RegistroHorasRequestDTO {

    @NotNull(message = "El id del usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "La fecha de trabajo es obligatoria")
    private LocalDate fechaTrabajo;

    @NotNull(message = "Las horas trabajadas son obligatorias")
    @DecimalMin(value = "0.01", message = "Las horas trabajadas deben ser mayores a cero")
    private BigDecimal horasTrabajadas;

    private String descripcion;
}
