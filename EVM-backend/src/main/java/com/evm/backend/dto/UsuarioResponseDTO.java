package com.evm.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {

    private Long id;
    private RolSistemaResponseDTO rolSistema;
    private CargoResponseDTO cargo;
    private EstadoCatalogoResponseDTO estadoUsuario;
    private String nombre;
    private String correo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
