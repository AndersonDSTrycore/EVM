package com.evm.backend.mapper;

import com.evm.backend.domain.Proyecto;
import com.evm.backend.dto.ProyectoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProyectoMapper {

    private final EstadoCatalogoMapper estadoCatalogoMapper;

    public ProyectoResponseDTO toResponseDTO(Proyecto entidad) {
        if (entidad == null) return null;
        return ProyectoResponseDTO.builder()
                .id(entidad.getId())
                .estadoProyecto(estadoCatalogoMapper.fromEstadoProyecto(entidad.getEstadoProyecto()))
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .fechaInicio(entidad.getFechaInicio())
                .fechaFin(entidad.getFechaFin())
                .presupuestoTotal(entidad.getPresupuestoTotal())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }
}
