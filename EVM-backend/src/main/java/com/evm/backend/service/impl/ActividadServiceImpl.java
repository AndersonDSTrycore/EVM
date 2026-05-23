package com.evm.backend.service.impl;

import com.evm.backend.domain.Actividad;
import com.evm.backend.domain.EstadoActividad;
import com.evm.backend.domain.Proyecto;
import com.evm.backend.dto.ActividadRequestDTO;
import com.evm.backend.dto.ActividadResponseDTO;
import com.evm.backend.mapper.ActividadMapper;
import com.evm.backend.repository.ActividadRepository;
import com.evm.backend.repository.EstadoActividadRepository;
import com.evm.backend.repository.ProyectoRepository;
import com.evm.backend.service.ActividadService;
import com.evm.backend.service.WebSocketEventoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActividadServiceImpl implements ActividadService {

    private static final String CODIGO_ESTADO_ACTIVA = "ACTIVA";
    private static final String CODIGO_ESTADO_CANCELADA = "CANCELADA";
    private static final String CODIGO_ESTADO_PROYECTO_CANCELADO = "CANCELADO";

    private final ActividadRepository actividadRepository;
    private final EstadoActividadRepository estadoActividadRepository;
    private final ProyectoRepository proyectoRepository;
    private final ActividadMapper actividadMapper;
    private final WebSocketEventoService webSocketEventoService;

    @Override
    @Transactional(readOnly = true)
    public List<ActividadResponseDTO> listarPorProyecto(Long idProyecto) {
        buscarProyectoPorId(idProyecto);
        List<Actividad> actividades = actividadRepository.findByProyecto_Id(idProyecto);
        log.info("Consulta de actividades para proyecto id={}: {} registros encontrados", idProyecto, actividades.size());
        return actividades.stream()
                .map(actividadMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ActividadResponseDTO obtenerPorId(Long id) {
        Actividad actividad = buscarActividadPorId(id);
        return actividadMapper.toResponseDTO(actividad);
    }

    @Override
    @Transactional
    public ActividadResponseDTO crear(Long idProyecto, ActividadRequestDTO dto) {
        Proyecto proyecto = buscarProyectoPorId(idProyecto);
        validarProyectoNoEsCancelado(proyecto);
        validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        EstadoActividad estadoActiva = estadoActividadRepository.findByCodigo(CODIGO_ESTADO_ACTIVA)
                .orElseThrow(() -> {
                    log.error("Estado de actividad '{}' no encontrado en catálogo", CODIGO_ESTADO_ACTIVA);
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Estado inicial de actividad no disponible");
                });

        validarPresupuestoAlCrear(idProyecto, dto.getBac(), proyecto.getPresupuestoTotal());

        Actividad actividad = Actividad.builder()
                .proyecto(proyecto)
                .estadoActividad(estadoActiva)
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .bac(dto.getBac())
                .porcentajeAvancePlanificado(dto.getPorcentajeAvancePlanificado())
                .porcentajeAvanceReal(dto.getPorcentajeAvanceReal())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .fechaCreacion(LocalDateTime.now())
                .fechaModificacion(LocalDateTime.now())
                .build();

        Actividad guardada = actividadRepository.save(actividad);
        log.info("Actividad creada con id={} nombre='{}' para proyecto id={}", guardada.getId(), guardada.getNombre(), idProyecto);
        webSocketEventoService.publicarEventoActividad("ACTIVIDAD_CREADA", idProyecto, guardada.getId(),
                "Actividad '" + guardada.getNombre() + "' creada en proyecto id=" + idProyecto);
        webSocketEventoService.publicarEventoIndicadores(idProyecto, guardada.getId(),
                "Indicadores recalculados por nueva actividad.");
        return actividadMapper.toResponseDTO(guardada);
    }

    @Override
    @Transactional
    public ActividadResponseDTO actualizar(Long id, ActividadRequestDTO dto) {
        Actividad actividad = buscarActividadPorId(id);
        validarActividadNoEsCancelada(actividad);
        validarFechas(dto.getFechaInicio(), dto.getFechaFin());

        Proyecto proyecto = actividad.getProyecto();
        validarPresupuestoAlEditar(proyecto.getId(), id, dto.getBac(), proyecto.getPresupuestoTotal());

        actividad.setNombre(dto.getNombre());
        actividad.setDescripcion(dto.getDescripcion());
        actividad.setBac(dto.getBac());
        actividad.setPorcentajeAvancePlanificado(dto.getPorcentajeAvancePlanificado());
        actividad.setPorcentajeAvanceReal(dto.getPorcentajeAvanceReal());
        actividad.setFechaInicio(dto.getFechaInicio());
        actividad.setFechaFin(dto.getFechaFin());
        actividad.setFechaModificacion(LocalDateTime.now());

        Actividad actualizada = actividadRepository.save(actividad);
        log.info("Actividad actualizada id={} nombre='{}'", actualizada.getId(), actualizada.getNombre());
        webSocketEventoService.publicarEventoActividad("ACTIVIDAD_ACTUALIZADA",
                actualizada.getProyecto().getId(), actualizada.getId(),
                "Actividad '" + actualizada.getNombre() + "' actualizada.");
        webSocketEventoService.publicarEventoIndicadores(actualizada.getProyecto().getId(),
                actualizada.getId(), "Indicadores recalculados por actualización de actividad.");
        return actividadMapper.toResponseDTO(actualizada);
    }

    @Override
    @Transactional
    public ActividadResponseDTO cancelar(Long id) {
        Actividad actividad = buscarActividadPorId(id);

        if (CODIGO_ESTADO_CANCELADA.equals(actividad.getEstadoActividad().getCodigo())) {
            log.warn("Intento de cancelar actividad ya cancelada id={}", id);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La actividad ya se encuentra cancelada");
        }

        EstadoActividad estadoCancelada = estadoActividadRepository.findByCodigo(CODIGO_ESTADO_CANCELADA)
                .orElseThrow(() -> {
                    log.error("Estado de actividad '{}' no encontrado en catálogo", CODIGO_ESTADO_CANCELADA);
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Estado de cancelación de actividad no disponible");
                });

        actividad.setEstadoActividad(estadoCancelada);
        actividad.setFechaModificacion(LocalDateTime.now());

        Actividad cancelada = actividadRepository.save(actividad);
        log.info("Actividad cancelada id={} nombre='{}'", cancelada.getId(), cancelada.getNombre());
        webSocketEventoService.publicarEventoActividad("ACTIVIDAD_CANCELADA",
                cancelada.getProyecto().getId(), cancelada.getId(),
                "Actividad '" + cancelada.getNombre() + "' cancelada.");
        webSocketEventoService.publicarEventoIndicadores(cancelada.getProyecto().getId(),
                cancelada.getId(), "Indicadores recalculados por cancelación de actividad.");
        return actividadMapper.toResponseDTO(cancelada);
    }

    private Proyecto buscarProyectoPorId(Long id) {
        return proyectoRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Proyecto no encontrado id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Proyecto no encontrado con id: " + id);
                });
    }

    private Actividad buscarActividadPorId(Long id) {
        return actividadRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Actividad no encontrada id={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Actividad no encontrada con id: " + id);
                });
    }

    private void validarProyectoNoEsCancelado(Proyecto proyecto) {
        if (CODIGO_ESTADO_PROYECTO_CANCELADO.equals(proyecto.getEstadoProyecto().getCodigo())) {
            log.warn("Intento de crear actividad en proyecto cancelado id={}", proyecto.getId());
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No se pueden crear actividades en un proyecto cancelado");
        }
    }

    private void validarActividadNoEsCancelada(Actividad actividad) {
        if (CODIGO_ESTADO_CANCELADA.equals(actividad.getEstadoActividad().getCodigo())) {
            log.warn("Intento de editar actividad cancelada id={}", actividad.getId());
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No se puede editar una actividad cancelada");
        }
    }

    private void validarFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaFin.isBefore(fechaInicio)) {
            log.warn("Validación fallida: fechaFin {} es anterior a fechaInicio {}", fechaFin, fechaInicio);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }

    private void validarPresupuestoAlCrear(Long idProyecto, BigDecimal bacNueva, BigDecimal presupuestoTotal) {
        BigDecimal sumaBacExistente = actividadRepository.sumarBacNoCanceladas(idProyecto);
        if (sumaBacExistente.add(bacNueva).compareTo(presupuestoTotal) > 0) {
            log.warn("Presupuesto del proyecto id={} excedido al crear actividad. Suma actual={} + nueva BAC={} > presupuesto={}",
                    idProyecto, sumaBacExistente, bacNueva, presupuestoTotal);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La suma de los presupuestos de las actividades supera el presupuesto total del proyecto");
        }
    }

    private void validarPresupuestoAlEditar(Long idProyecto, Long idActividad, BigDecimal bacNueva, BigDecimal presupuestoTotal) {
        BigDecimal sumaBacSinEsta = actividadRepository.sumarBacNoCanceladasExcluyendo(idProyecto, idActividad);
        if (sumaBacSinEsta.add(bacNueva).compareTo(presupuestoTotal) > 0) {
            log.warn("Presupuesto del proyecto id={} excedido al editar actividad id={}. Suma={} + nueva BAC={} > presupuesto={}",
                    idProyecto, idActividad, sumaBacSinEsta, bacNueva, presupuestoTotal);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La suma de los presupuestos de las actividades supera el presupuesto total del proyecto");
        }
    }
}
