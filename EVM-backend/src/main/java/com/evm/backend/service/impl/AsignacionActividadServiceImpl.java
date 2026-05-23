package com.evm.backend.service.impl;

import com.evm.backend.domain.Actividad;
import com.evm.backend.domain.AsignacionActividad;
import com.evm.backend.domain.EstadoAsignacion;
import com.evm.backend.domain.Usuario;
import com.evm.backend.dto.AsignacionActividadRequestDTO;
import com.evm.backend.dto.AsignacionActividadResponseDTO;
import com.evm.backend.dto.UsuarioDisponibleResponseDTO;
import com.evm.backend.mapper.AsignacionActividadMapper;
import com.evm.backend.repository.ActividadRepository;
import com.evm.backend.repository.AsignacionActividadRepository;
import com.evm.backend.repository.EstadoAsignacionRepository;
import com.evm.backend.repository.UsuarioRepository;
import com.evm.backend.service.AsignacionActividadService;
import com.evm.backend.service.WebSocketEventoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsignacionActividadServiceImpl implements AsignacionActividadService {

    private static final String CODIGO_ESTADO_ASIGNACION_ACTIVA = "ACTIVA";
    private static final String CODIGO_ESTADO_ASIGNACION_RETIRADA = "RETIRADA";
    private static final String CODIGO_ESTADO_ACTIVIDAD_CANCELADA = "CANCELADA";
    private static final String CODIGO_ESTADO_PROYECTO_CANCELADO = "CANCELADO";
    private static final String CODIGO_ESTADO_USUARIO_ACTIVO = "ACTIVO";

    private final AsignacionActividadRepository asignacionRepository;
    private final ActividadRepository actividadRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoAsignacionRepository estadoAsignacionRepository;
    private final AsignacionActividadMapper asignacionMapper;
    private final WebSocketEventoService webSocketEventoService;

    @Override
    @Transactional(readOnly = true)
    public List<AsignacionActividadResponseDTO> listarPorActividad(Long idActividad) {
        buscarActividadPorId(idActividad);
        List<AsignacionActividad> asignaciones = asignacionRepository.findByActividad_Id(idActividad);
        log.info("Consulta de asignaciones para actividad id={}: {} registros encontrados", idActividad, asignaciones.size());
        return asignaciones.stream()
                .map(asignacionMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDisponibleResponseDTO> listarUsuariosDisponibles(Long idActividad) {
        buscarActividadPorId(idActividad);
        List<Long> idsAsignados = asignacionRepository.findIdsUsuariosConAsignacionActiva(idActividad);
        List<Usuario> todosUsuarios = usuarioRepository.findAll();
        List<UsuarioDisponibleResponseDTO> disponibles = todosUsuarios.stream()
                .filter(u -> CODIGO_ESTADO_USUARIO_ACTIVO.equals(
                        u.getEstadoUsuario() != null ? u.getEstadoUsuario().getCodigo() : null))
                .filter(u -> !idsAsignados.contains(u.getId()))
                .map(asignacionMapper::toUsuarioDisponibleDTO)
                .toList();
        log.info("Consulta de usuarios disponibles para actividad id={}: {} encontrados", idActividad, disponibles.size());
        return disponibles;
    }

    @Override
    @Transactional
    public List<AsignacionActividadResponseDTO> asignar(Long idActividad, AsignacionActividadRequestDTO dto) {
        Actividad actividad = buscarActividadPorId(idActividad);
        validarActividadNoEsCancelada(actividad);
        validarProyectoNoEsCancelado(actividad);

        EstadoAsignacion estadoActiva = obtenerEstadoAsignacion(CODIGO_ESTADO_ASIGNACION_ACTIVA);

        List<AsignacionActividad> nuevasAsignaciones = new ArrayList<>();

        for (Long idUsuario : dto.getIdsUsuarios()) {
            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> {
                        log.warn("Intento de asignar usuario inexistente id={} a actividad id={}", idUsuario, idActividad);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Usuario no encontrado: id=" + idUsuario);
                    });

            validarUsuarioActivo(usuario, idActividad);
            validarNoAsignacionDuplicada(idActividad, idUsuario);

            LocalDateTime ahora = LocalDateTime.now();
            AsignacionActividad asignacion = AsignacionActividad.builder()
                    .actividad(actividad)
                    .usuario(usuario)
                    .estadoAsignacion(estadoActiva)
                    .fechaAsignacion(ahora)
                    .fechaRetiro(null)
                    .fechaCreacion(ahora)
                    .fechaModificacion(ahora)
                    .build();

            nuevasAsignaciones.add(asignacionRepository.save(asignacion));
            log.info("Usuario id={} asignado a actividad id={}", idUsuario, idActividad);
        }

        if (dto.getIdsUsuarios().size() > 1) {
            log.info("Total de {} usuarios asignados a actividad id={}", nuevasAsignaciones.size(), idActividad);
        }

        webSocketEventoService.publicarEventoAsignacion("USUARIO_ASIGNADO_ACTIVIDAD",
                idActividad, null, dto.getIdsUsuarios().size() + " usuario(s) asignado(s) a actividad id=" + idActividad);

        return nuevasAsignaciones.stream()
                .map(asignacionMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public AsignacionActividadResponseDTO retirar(Long idAsignacion) {
        AsignacionActividad asignacion = asignacionRepository.findById(idAsignacion)
                .orElseThrow(() -> {
                    log.warn("Intento de retiro de asignación inexistente id={}", idAsignacion);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Asignación no encontrada: id=" + idAsignacion);
                });

        String codigoEstadoActual = asignacion.getEstadoAsignacion() != null
                ? asignacion.getEstadoAsignacion().getCodigo()
                : null;

        if (!CODIGO_ESTADO_ASIGNACION_ACTIVA.equals(codigoEstadoActual)) {
            log.warn("Intento de retiro inválido: asignación id={} ya está en estado '{}'",
                    idAsignacion, codigoEstadoActual);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La asignación ya está retirada o en estado inválido para retiro");
        }

        EstadoAsignacion estadoRetirada = obtenerEstadoAsignacion(CODIGO_ESTADO_ASIGNACION_RETIRADA);

        LocalDateTime ahora = LocalDateTime.now();
        asignacion.setEstadoAsignacion(estadoRetirada);
        asignacion.setFechaRetiro(ahora);
        asignacion.setFechaModificacion(ahora);

        AsignacionActividad guardada = asignacionRepository.save(asignacion);

        log.info("Usuario id={} retirado de actividad id={} (asignación id={})",
                asignacion.getUsuario() != null ? asignacion.getUsuario().getId() : null,
                asignacion.getActividad() != null ? asignacion.getActividad().getId() : null,
                idAsignacion);

        webSocketEventoService.publicarEventoAsignacion("USUARIO_RETIRADO_ACTIVIDAD",
                guardada.getActividad() != null ? guardada.getActividad().getId() : null,
                guardada.getId(), "Usuario retirado de actividad id=" +
                        (guardada.getActividad() != null ? guardada.getActividad().getId() : null));

        return asignacionMapper.toResponseDTO(guardada);
    }

    // --- Métodos auxiliares privados ---

    private Actividad buscarActividadPorId(Long idActividad) {
        return actividadRepository.findById(idActividad)
                .orElseThrow(() -> {
                    log.warn("Actividad no encontrada id={}", idActividad);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Actividad no encontrada: id=" + idActividad);
                });
    }

    private EstadoAsignacion obtenerEstadoAsignacion(String codigo) {
        return estadoAsignacionRepository.findByCodigo(codigo)
                .orElseThrow(() -> {
                    log.error("Estado de asignación '{}' no encontrado en catálogo", codigo);
                    return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "Estado de asignación no disponible: " + codigo);
                });
    }

    private void validarActividadNoEsCancelada(Actividad actividad) {
        if (actividad.getEstadoActividad() != null
                && CODIGO_ESTADO_ACTIVIDAD_CANCELADA.equals(actividad.getEstadoActividad().getCodigo())) {
            log.warn("Intento de asignación sobre actividad cancelada id={}", actividad.getId());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede asignar usuarios a una actividad cancelada");
        }
    }

    private void validarProyectoNoEsCancelado(Actividad actividad) {
        if (actividad.getProyecto() != null
                && actividad.getProyecto().getEstadoProyecto() != null
                && CODIGO_ESTADO_PROYECTO_CANCELADO.equals(
                        actividad.getProyecto().getEstadoProyecto().getCodigo())) {
            log.warn("Intento de asignación sobre actividad de proyecto cancelado, actividad id={}", actividad.getId());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede asignar usuarios a una actividad de un proyecto cancelado");
        }
    }

    private void validarUsuarioActivo(Usuario usuario, Long idActividad) {
        String codigoEstadoUsuario = usuario.getEstadoUsuario() != null
                ? usuario.getEstadoUsuario().getCodigo()
                : null;
        if (!CODIGO_ESTADO_USUARIO_ACTIVO.equals(codigoEstadoUsuario)) {
            log.warn("Intento de asignar usuario inactivo id={} a actividad id={}", usuario.getId(), idActividad);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El usuario no está activo: id=" + usuario.getId());
        }
    }

    private void validarNoAsignacionDuplicada(Long idActividad, Long idUsuario) {
        boolean duplicada = asignacionRepository
                .existsByActividad_IdAndUsuario_IdAndEstadoAsignacion_Codigo(
                        idActividad, idUsuario, CODIGO_ESTADO_ASIGNACION_ACTIVA);
        if (duplicada) {
            log.warn("Intento de asignación duplicada: usuario id={} ya tiene asignación activa en actividad id={}",
                    idUsuario, idActividad);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El usuario ya tiene una asignación activa en esta actividad: id=" + idUsuario);
        }
    }
}
