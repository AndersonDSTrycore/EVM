package com.evm.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal valorHora;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
