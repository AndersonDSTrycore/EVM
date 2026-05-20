package com.evm.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;

    @JsonProperty("tipo_token")
    private String tipoToken;

    private UsuarioSesionDTO usuario;
}
