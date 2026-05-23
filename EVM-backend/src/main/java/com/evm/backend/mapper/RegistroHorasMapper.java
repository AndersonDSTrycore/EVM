package com.evm.backend.mapper;

import com.evm.backend.domain.RegistroHoras;
import com.evm.backend.domain.Usuario;
import com.evm.backend.dto.RegistroHorasResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class RegistroHorasMapper {

    public RegistroHorasResponseDTO toResponseDTO(RegistroHoras entidad) {
        if (entidad == null) return null;

        Usuario usuario = entidad.getUsuario();
        Usuario usuarioRegistra = entidad.getUsuarioRegistra();

        return RegistroHorasResponseDTO.builder()
                .id(entidad.getId())
                .idActividad(entidad.getActividad() != null ? entidad.getActividad().getId() : null)
                .nombreActividad(entidad.getActividad() != null ? entidad.getActividad().getNombre() : null)
                .idUsuario(usuario != null ? usuario.getId() : null)
                .nombreUsuario(usuario != null ? usuario.getNombre() : null)
                .correoUsuario(usuario != null ? usuario.getCorreo() : null)
                .cargoUsuario(usuario != null && usuario.getCargo() != null ? usuario.getCargo().getNombre() : null)
                .idUsuarioRegistra(usuarioRegistra != null ? usuarioRegistra.getId() : null)
                .nombreUsuarioRegistra(usuarioRegistra != null ? usuarioRegistra.getNombre() : null)
                .fechaTrabajo(entidad.getFechaTrabajo())
                .horasTrabajadas(entidad.getHorasTrabajadas())
                .valorHoraHistorico(entidad.getValorHoraHistorico())
                .costoTotal(entidad.getCostoTotal())
                .descripcion(entidad.getDescripcion())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaModificacion(entidad.getFechaModificacion())
                .build();
    }
}
