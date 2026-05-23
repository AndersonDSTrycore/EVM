package com.evm.backend.mapper;

import com.evm.backend.domain.EstadoUsuario;
import com.evm.backend.domain.EstadoProyecto;
import com.evm.backend.domain.EstadoActividad;
import com.evm.backend.domain.EstadoAsignacion;
import com.evm.backend.dto.EstadoCatalogoResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class EstadoCatalogoMapper {

    public EstadoCatalogoResponseDTO fromEstadoUsuario(EstadoUsuario entidad) {
        if (entidad == null) return null;
        return EstadoCatalogoResponseDTO.builder()
                .id(entidad.getId())
                .codigo(entidad.getCodigo())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .activo(entidad.getActivo())
                .build();
    }

    public EstadoCatalogoResponseDTO fromEstadoProyecto(EstadoProyecto entidad) {
        if (entidad == null) return null;
        return EstadoCatalogoResponseDTO.builder()
                .id(entidad.getId())
                .codigo(entidad.getCodigo())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .activo(entidad.getActivo())
                .build();
    }

    public EstadoCatalogoResponseDTO fromEstadoActividad(EstadoActividad entidad) {
        if (entidad == null) return null;
        return EstadoCatalogoResponseDTO.builder()
                .id(entidad.getId())
                .codigo(entidad.getCodigo())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .activo(entidad.getActivo())
                .build();
    }

    public EstadoCatalogoResponseDTO fromEstadoAsignacion(EstadoAsignacion entidad) {
        if (entidad == null) return null;
        return EstadoCatalogoResponseDTO.builder()
                .id(entidad.getId())
                .codigo(entidad.getCodigo())
                .nombre(entidad.getNombre())
                .descripcion(entidad.getDescripcion())
                .activo(entidad.getActivo())
                .build();
    }
}
