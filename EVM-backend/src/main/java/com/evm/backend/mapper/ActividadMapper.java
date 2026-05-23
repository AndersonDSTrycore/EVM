package com.evm.backend.mapper;

import com.evm.backend.domain.Actividad;
import com.evm.backend.dto.ActividadResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActividadMapper {

    private final EstadoCatalogoMapper estadoCatalogoMapper;

    public ActividadResponseDTO toResponseDTO(Actividad entidad) {
        if (entidad == null) return null;
        return ActividadResponseDTO.builder()
                .id(entidad.getId())
                .idProyecto(entidad.getProyecto() != null ? entidad.getProyecto().getId() : null)
                .nombreProyecto(entidad.getProyecto() != null ? entidad.getProyecto().getNombre() : null)
                .estadoActividad(estadoCatalogoMapper.fromEstadoActividad(entidad.getEstadoActividad()))
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .bac(entidad.getBac())
                .porcentajeAvancePlanificado(entidad.getPorcentajeAvancePlanificado())
                .porcentajeAvanceReal(entidad.getPorcentajeAvanceReal())
                .fechaInicio(entidad.getFechaInicio())
                .fechaFin(entidad.getFechaFin())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }
}
