package com.evm.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoCatalogoResponseDTO {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
