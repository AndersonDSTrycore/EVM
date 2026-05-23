package com.evm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignacionActividadRequestDTO {

    @NotEmpty
    private List<Long> idsUsuarios;
}
