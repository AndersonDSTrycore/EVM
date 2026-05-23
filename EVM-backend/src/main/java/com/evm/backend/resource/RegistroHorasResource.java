package com.evm.backend.resource;

import com.evm.backend.dto.RegistroHorasRequestDTO;
import com.evm.backend.dto.RegistroHorasResponseDTO;
import com.evm.backend.security.UsuarioAutenticado;
import com.evm.backend.service.RegistroHorasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RegistroHorasResource {

    private final RegistroHorasService registroHorasService;

    @GetMapping("/api/actividades/{idActividad}/registros-horas")
    public ResponseEntity<List<RegistroHorasResponseDTO>> listarPorActividad(
            @PathVariable Long idActividad) {
        return ResponseEntity.ok(registroHorasService.listarPorActividad(idActividad));
    }

    @PostMapping("/api/actividades/{idActividad}/registros-horas")
    public ResponseEntity<RegistroHorasResponseDTO> registrar(
            @PathVariable Long idActividad,
            @Valid @RequestBody RegistroHorasRequestDTO dto,
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registroHorasService.registrar(idActividad, dto, usuarioAutenticado));
    }
}
