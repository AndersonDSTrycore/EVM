package com.evm.backend.mapper;

import com.evm.backend.domain.Usuario;
import com.evm.backend.dto.UsuarioResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsuarioMapper {

    private final RolSistemaMapper rolSistemaMapper;
    private final CargoMapper cargoMapper;
    private final EstadoCatalogoMapper estadoCatalogoMapper;

    public UsuarioResponseDTO toResponseDTO(Usuario entidad) {
        if (entidad == null) return null;
        return UsuarioResponseDTO.builder()
                .id(entidad.getId())
                .rolSistema(rolSistemaMapper.toResponseDTO(entidad.getRolSistema()))
                .cargo(cargoMapper.toResponseDTO(entidad.getCargo()))
                .estadoUsuario(estadoCatalogoMapper.fromEstadoUsuario(entidad.getEstadoUsuario()))
                .nombre(entidad.getNombre())
                .correo(entidad.getCorreo())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }
}
