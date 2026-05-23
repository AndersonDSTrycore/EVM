package com.evm.backend.resource;

import com.evm.backend.dto.ProyectoRequestDTO;
import com.evm.backend.dto.ProyectoResponseDTO;
import com.evm.backend.service.ProyectoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
@RequiredArgsConstructor
public class ProyectoResource {

    private final ProyectoService proyectoService;

    @GetMapping
    public ResponseEntity<List<ProyectoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(proyectoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProyectoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(proyectoService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ProyectoResponseDTO> crear(@Valid @RequestBody ProyectoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(proyectoService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ProyectoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProyectoRequestDTO dto) {
        return ResponseEntity.ok(proyectoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<ProyectoResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(proyectoService.cancelar(id));
    }
}
