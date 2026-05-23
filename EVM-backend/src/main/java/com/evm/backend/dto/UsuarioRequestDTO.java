package com.evm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioRequestDTO {

    @NotNull
    private Long idRolSistema;

    @NotNull
    private Long idCargo;

    @NotNull
    private Long idEstadoUsuario;

    @NotBlank
    private String nombre;

    @NotBlank
    @Email
    private String correo;

    @NotBlank
    private String contrasena;
}
