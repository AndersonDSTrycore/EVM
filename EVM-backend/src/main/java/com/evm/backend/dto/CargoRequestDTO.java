package com.evm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoRequestDTO {

    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal valorHora;

    @NotNull
    private Boolean activo;
}
