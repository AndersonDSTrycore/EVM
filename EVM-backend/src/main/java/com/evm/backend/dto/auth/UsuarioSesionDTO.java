package com.evm.backend.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioSesionDTO {

    private Long id;
    private String nombre;
    private String correo;
    private String rol;
}
