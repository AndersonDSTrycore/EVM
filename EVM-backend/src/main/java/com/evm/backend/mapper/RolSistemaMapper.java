package com.evm.backend.mapper;

import com.evm.backend.domain.RolSistema;
import com.evm.backend.dto.RolSistemaResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class RolSistemaMapper {

    public RolSistemaResponseDTO toResponseDTO(RolSistema entidad) {
        if (entidad == null) return null;
        return RolSistemaResponseDTO.builder()
                .id(entidad.getId())
                .codigo(entidad.getCodigo())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .activo(entidad.getActivo())
                .build();
    }
}
