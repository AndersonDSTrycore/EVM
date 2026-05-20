package com.evm.backend.service.impl;

import com.evm.backend.domain.EstadoProyecto;
import com.evm.backend.domain.Proyecto;
import com.evm.backend.dto.ProyectoRequestDTO;
import com.evm.backend.dto.ProyectoResponseDTO;
import com.evm.backend.mapper.ProyectoMapper;
import com.evm.backend.repository.EstadoProyectoRepository;
import com.evm.backend.repository.ProyectoRepository;
import com.evm.backend.service.ProyectoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProyectoServiceImpl implements ProyectoService {

    private static final String CODIGO_ESTADO_ACTIVO = "ACTIVO";
    private static final String CODIGO_ESTADO_CANCELADO = "CANCELADO";

    private final ProyectoRepository proyectoRepository;
    private final EstadoProyectoRepository estadoProyectoRepository;
    private final ProyectoMapper proyectoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProyectoResponseDTO> listarTodos() {
        List<Proyecto> proyectos = proyectoRepository.findAll();
        log.info("Consulta de proyectos: {} registros encontrados", proyectos.size());
        return proyectos.stream()
                .map(proyectoMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProyectoResponseDTO obtenerPorId(Long id) {
        Proyecto proyecto = buscarProyectoPorId(id);
        return proyectoMapper.toResponseDTO(proyecto);
    }

    @Override
    @Transactional
    public ProyectoResponseDTO crear(ProyectoRequestDTO dto) {
        validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        EstadoProyecto estadoActivo = estadoProyectoRepository.findByCodigo(CODIGO_ESTADO_ACTIVO)
                .orElseThrow(() -> {
                    log.error("Estado de proyecto '{}' no encontrado en catálogo", CODIGO_ESTADO_ACTIVO);
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Estado inicial de proyecto no disponible");
                });

        Proyecto proyecto = Proyecto.builder()
                .estadoProyecto(estadoActivo)
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .presupuestoTotal(dto.getPresupuestoTotal())
                .fechaCreacion(LocalDateTime.now())
                .fechaModificacion(LocalDateTime.now())
                .build();

        Proyecto guardado = proyectoRepository.save(proyecto);
        log.info("Proyecto creado con id={} nombre='{}'", guardado.getId(), guardado.getNombre());
        return proyectoMapper.toResponseDTO(guardado);
    }

    @Override
    @Transactional
    public ProyectoResponseDTO actualizar(Long id, ProyectoRequestDTO dto) {
        Proyecto proyecto = buscarProyectoPorId(id);

        if (CODIGO_ESTADO_CANCELADO.equals(proyecto.getEstadoProyecto().getCodigo())) {
            log.warn("Intento de editar proyecto cancelado id={}", id);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No se puede editar un proyecto cancelado");
        }

        validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        proyecto.setNombre(dto.getNombre());
        proyecto.setDescripcion(dto.getDescripcion());
        proyecto.setFechaInicio(dto.getFechaInicio());
        proyecto.setFechaFin(dto.getFechaFin());
        proyecto.setPresupuestoTotal(dto.getPresupuestoTotal());
        proyecto.setFechaModificacion(LocalDateTime.now());

        Proyecto actualizado = proyectoRepository.save(proyecto);
        log.info("Proyecto actualizado id={} nombre='{}'", actualizado.getId(), actualizado.getNombre());
        return proyectoMapper.toResponseDTO(actualizado);
    }

    @Override
    @Transactional
    public ProyectoResponseDTO cancelar(Long id) {
        Proyecto proyecto = buscarProyectoPorId(id);

        if (CODIGO_ESTADO_CANCELADO.equals(proyecto.getEstadoProyecto().getCodigo())) {
            log.warn("Intento de cancelar proyecto ya cancelado id={}", id);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El proyecto ya se encuentra cancelado");
        }

        EstadoProyecto estadoCancelado = estadoProyectoRepository.findByCodigo(CODIGO_ESTADO_CANCELADO)
                .orElseThrow(() -> {
                    log.error("Estado de proyecto '{}' no encontrado en catálogo", CODIGO_ESTADO_CANCELADO);
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Estado de cancelación no disponible");
                });

        proyecto.setEstadoProyecto(estadoCancelado);
        proyecto.setFechaModificacion(LocalDateTime.now());

        Proyecto cancelado = proyectoRepository.save(proyecto);
        log.info("Proyecto cancelado id={} nombre='{}'", cancelado.getId(), cancelado.getNombre());
        return proyectoMapper.toResponseDTO(cancelado);
    }

    private Proyecto buscarProyectoPorId(Long id) {
        return proyectoRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Proyecto no encontrado id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Proyecto no encontrado con id: " + id);
                });
    }

    private void validarFechas(java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin) {
        if (fechaFin.isBefore(fechaInicio)) {
            log.warn("Validación fallida: fechaFin {} es anterior a fechaInicio {}", fechaFin, fechaInicio);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }
}
