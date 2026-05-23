package com.evm.backend.service;

import com.evm.backend.dto.ActividadRequestDTO;
import com.evm.backend.dto.ActividadResponseDTO;

import java.util.List;

public interface ActividadService {

    List<ActividadResponseDTO> listarPorProyecto(Long idProyecto);

    ActividadResponseDTO obtenerPorId(Long id);

    ActividadResponseDTO crear(Long idProyecto, ActividadRequestDTO dto);

    ActividadResponseDTO actualizar(Long id, ActividadRequestDTO dto);

    ActividadResponseDTO cancelar(Long id);
}
