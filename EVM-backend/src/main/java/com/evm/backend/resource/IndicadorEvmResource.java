package com.evm.backend.resource;

import com.evm.backend.dto.IndicadoresEvmActividadResponseDTO;
import com.evm.backend.dto.IndicadoresEvmProyectoResponseDTO;
import com.evm.backend.service.IndicadorEvmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class IndicadorEvmResource {

    private final IndicadorEvmService indicadorEvmService;

    @GetMapping("/api/proyectos/{idProyecto}/indicadores")
    public ResponseEntity<IndicadoresEvmProyectoResponseDTO> indicadoresProyecto(
            @PathVariable Long idProyecto,
            @RequestParam(required = false) String filtro) {
        return ResponseEntity.ok(indicadorEvmService.calcularIndicadoresProyecto(idProyecto, filtro));
    }

    @GetMapping("/api/actividades/{idActividad}/indicadores")
    public ResponseEntity<IndicadoresEvmActividadResponseDTO> indicadoresActividad(
            @PathVariable Long idActividad) {
        return ResponseEntity.ok(indicadorEvmService.calcularIndicadoresActividad(idActividad));
    }
}

