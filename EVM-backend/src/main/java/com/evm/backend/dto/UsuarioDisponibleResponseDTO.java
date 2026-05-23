package com.evm.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDisponibleResponseDTO {

    private Long id;
    private String nombre;
    private String correo;
    private String cargo;
    private String rol;
}
