package com.evm.backend.service;

import com.evm.backend.dto.ProyectoRequestDTO;
import com.evm.backend.dto.ProyectoResponseDTO;

import java.util.List;

public interface ProyectoService {

    List<ProyectoResponseDTO> listarTodos();

    ProyectoResponseDTO obtenerPorId(Long id);

    ProyectoResponseDTO crear(ProyectoRequestDTO dto);

    ProyectoResponseDTO actualizar(Long id, ProyectoRequestDTO dto);

    ProyectoResponseDTO cancelar(Long id);
}
