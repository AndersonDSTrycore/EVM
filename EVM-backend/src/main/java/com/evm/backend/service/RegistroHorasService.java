package com.evm.backend.service;

import com.evm.backend.dto.RegistroHorasRequestDTO;
import com.evm.backend.dto.RegistroHorasResponseDTO;
import com.evm.backend.security.UsuarioAutenticado;

import java.util.List;

public interface RegistroHorasService {

    List<RegistroHorasResponseDTO> listarPorActividad(Long idActividad);

    RegistroHorasResponseDTO registrar(Long idActividad, RegistroHorasRequestDTO dto, UsuarioAutenticado usuarioAutenticado);
}
