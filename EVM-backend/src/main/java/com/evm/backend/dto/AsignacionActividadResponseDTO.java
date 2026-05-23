package com.evm.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignacionActividadResponseDTO {

    private Long id;
    private Long idActividad;
    private String nombreActividad;
    private Long idUsuario;
    private String nombreUsuario;
    private String correoUsuario;
    private String cargoUsuario;
    private EstadoCatalogoResponseDTO estadoAsignacion;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaRetiro;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
