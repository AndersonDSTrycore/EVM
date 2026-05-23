package com.evm.backend.service;

import com.evm.backend.dto.AsignacionActividadRequestDTO;
import com.evm.backend.dto.AsignacionActividadResponseDTO;
import com.evm.backend.dto.UsuarioDisponibleResponseDTO;

import java.util.List;

public interface AsignacionActividadService {

    List<AsignacionActividadResponseDTO> listarPorActividad(Long idActividad);

    List<UsuarioDisponibleResponseDTO> listarUsuariosDisponibles(Long idActividad);

    List<AsignacionActividadResponseDTO> asignar(Long idActividad, AsignacionActividadRequestDTO dto);

    AsignacionActividadResponseDTO retirar(Long idAsignacion);
}
