package com.evm.backend.resource;

import com.evm.backend.dto.ActividadRequestDTO;
import com.evm.backend.dto.ActividadResponseDTO;
import com.evm.backend.service.ActividadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ActividadResource {

    private final ActividadService actividadService;

    @GetMapping("/api/proyectos/{idProyecto}/actividades")
    public ResponseEntity<List<ActividadResponseDTO>> listarPorProyecto(@PathVariable Long idProyecto) {
        return ResponseEntity.ok(actividadService.listarPorProyecto(idProyecto));
    }

    @GetMapping("/api/actividades/{id}")
    public ResponseEntity<ActividadResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(actividadService.obtenerPorId(id));
    }

    @PostMapping("/api/proyectos/{idProyecto}/actividades")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ActividadResponseDTO> crear(
            @PathVariable Long idProyecto,
            @Valid @RequestBody ActividadRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(actividadService.crear(idProyecto, dto));
    }

    @PutMapping("/api/actividades/{id}")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ActividadResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActividadRequestDTO dto) {
        return ResponseEntity.ok(actividadService.actualizar(id, dto));
    }

    @PatchMapping("/api/actividades/{id}/cancelar")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ActividadResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(actividadService.cancelar(id));
    }
}
