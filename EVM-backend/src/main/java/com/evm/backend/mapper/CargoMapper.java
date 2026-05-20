package com.evm.backend.mapper;

import com.evm.backend.domain.Cargo;
import com.evm.backend.dto.CargoResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class CargoMapper {

    public CargoResponseDTO toResponseDTO(Cargo entidad) {
        if (entidad == null) return null;
        return CargoResponseDTO.builder()
                .id(entidad.getId())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .valorHora(entidad.getValorHora())
                .activo(entidad.getActivo())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }
}
