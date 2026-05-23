package com.evm.backend.resource;

import com.evm.backend.dto.AsignacionActividadRequestDTO;
import com.evm.backend.dto.AsignacionActividadResponseDTO;
import com.evm.backend.dto.UsuarioDisponibleResponseDTO;
import com.evm.backend.service.AsignacionActividadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AsignacionActividadResource {

    private final AsignacionActividadService asignacionActividadService;

    @GetMapping("/api/actividades/{idActividad}/asignaciones")
    public ResponseEntity<List<AsignacionActividadResponseDTO>> listarPorActividad(
            @PathVariable Long idActividad) {
        return ResponseEntity.ok(asignacionActividadService.listarPorActividad(idActividad));
    }

    @GetMapping("/api/actividades/{idActividad}/usuarios-disponibles")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<List<UsuarioDisponibleResponseDTO>> listarUsuariosDisponibles(
            @PathVariable Long idActividad) {
        return ResponseEntity.ok(asignacionActividadService.listarUsuariosDisponibles(idActividad));
    }

    @PostMapping("/api/actividades/{idActividad}/asignaciones")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<List<AsignacionActividadResponseDTO>> asignar(
            @PathVariable Long idActividad,
            @Valid @RequestBody AsignacionActividadRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(asignacionActividadService.asignar(idActividad, dto));
    }

    @PatchMapping("/api/asignaciones/{idAsignacion}/retirar")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<AsignacionActividadResponseDTO> retirar(
            @PathVariable Long idAsignacion) {
        return ResponseEntity.ok(asignacionActividadService.retirar(idAsignacion));
    }
}
