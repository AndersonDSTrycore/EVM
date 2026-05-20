package com.evm.backend.mapper;

import com.evm.backend.domain.AsignacionActividad;
import com.evm.backend.domain.Usuario;
import com.evm.backend.dto.AsignacionActividadResponseDTO;
import com.evm.backend.dto.UsuarioDisponibleResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AsignacionActividadMapper {

    private final EstadoCatalogoMapper estadoCatalogoMapper;

    public AsignacionActividadResponseDTO toResponseDTO(AsignacionActividad entidad) {
        if (entidad == null) return null;
        Usuario usuario = entidad.getUsuario();
        return AsignacionActividadResponseDTO.builder()
                .id(entidad.getId())
                .idActividad(entidad.getActividad() != null ? entidad.getActividad().getId() : null)
                .nombreActividad(entidad.getActividad() != null ? entidad.getActividad().getNombre() : null)
                .idUsuario(usuario != null ? usuario.getId() : null)
                .nombreUsuario(usuario != null ? usuario.getNombre() : null)
                .correoUsuario(usuario != null ? usuario.getCorreo() : null)
                .cargoUsuario(usuario != null && usuario.getCargo() != null ? usuario.getCargo().getNombre() : null)
                .estadoAsignacion(estadoCatalogoMapper.fromEstadoAsignacion(entidad.getEstadoAsignacion()))
                .fechaAsignacion(entidad.getFechaAsignacion())
                .fechaRetiro(entidad.getFechaRetiro())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }

    public UsuarioDisponibleResponseDTO toUsuarioDisponibleDTO(Usuario usuario) {
        if (usuario == null) return null;
        return UsuarioDisponibleResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .cargo(usuario.getCargo() != null ? usuario.getCargo().getNombre() : null)
                .rol(usuario.getRolSistema() != null ? usuario.getRolSistema().getCodigo() : null)
                .build();
    }
}
