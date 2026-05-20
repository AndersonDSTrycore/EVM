package com.evm.backend.service;

import com.evm.backend.dto.IndicadoresEvmActividadResponseDTO;
import com.evm.backend.dto.IndicadoresEvmProyectoResponseDTO;

public interface IndicadorEvmService {

    IndicadoresEvmProyectoResponseDTO calcularIndicadoresProyecto(Long idProyecto, String filtro);

    IndicadoresEvmActividadResponseDTO calcularIndicadoresActividad(Long idActividad);
}
