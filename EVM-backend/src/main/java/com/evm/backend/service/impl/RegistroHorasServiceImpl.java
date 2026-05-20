package com.evm.backend.service.impl;

import com.evm.backend.domain.*;
import com.evm.backend.dto.RegistroHorasRequestDTO;
import com.evm.backend.dto.RegistroHorasResponseDTO;
import com.evm.backend.mapper.RegistroHorasMapper;
import com.evm.backend.repository.*;
import com.evm.backend.security.UsuarioAutenticado;
import com.evm.backend.service.RegistroHorasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistroHorasServiceImpl implements RegistroHorasService {

    private static final String CODIGO_ROL_LIDER = "LIDER";
    private static final String CODIGO_ROL_COLABORADOR = "COLABORADOR";
    private static final String CODIGO_ESTADO_ACTIVIDAD_CANCELADA = "CANCELADA";
    private static final String CODIGO_ESTADO_PROYECTO_CANCELADO = "CANCELADO";
    private static final String CODIGO_ESTADO_USUARIO_ACTIVO = "ACTIVO";
    private static final String CODIGO_ESTADO_ASIGNACION_ACTIVA = "ACTIVA";

    private final RegistroHorasRepository registroHorasRepository;
    private final ActividadRepository actividadRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsignacionActividadRepository asignacionRepository;
    private final RegistroHorasMapper registroHorasMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RegistroHorasResponseDTO> listarPorActividad(Long idActividad) {
        buscarActividadPorId(idActividad);
        List<RegistroHoras> registros = registroHorasRepository.findByActividad_Id(idActividad);
        log.info("Consulta de registros de horas para actividad id={}: {} registros encontrados",
                idActividad, registros.size());
        return registros.stream()
                .map(registroHorasMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public RegistroHorasResponseDTO registrar(Long idActividad, RegistroHorasRequestDTO dto,
                                               UsuarioAutenticado usuarioAutenticado) {
        Actividad actividad = buscarActividadPorId(idActividad);
        validarActividadNoEsCancelada(actividad);
        validarProyectoNoEsCancelado(actividad);

        Long idUsuarioTrabajo = dto.getIdUsuario();
        String rolAutenticado = usuarioAutenticado.getCodigoRol();

        // RN-013: Colaborador solo puede registrar sus propias horas
        if (CODIGO_ROL_COLABORADOR.equals(rolAutenticado)) {
            if (!usuarioAutenticado.getId().equals(idUsuarioTrabajo)) {
                log.warn("Colaborador id={} intentó registrar horas para otro usuario id={} en actividad id={}",
                        usuarioAutenticado.getId(), idUsuarioTrabajo, idActividad);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Un colaborador solo puede registrar sus propias horas");
            }
        }

        // Obtener usuario trabajado
        Usuario usuarioTrabajo = usuarioRepository.findById(idUsuarioTrabajo)
                .orElseThrow(() -> {
                    log.warn("Intento de registrar horas para usuario inexistente id={}", idUsuarioTrabajo);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Usuario no encontrado: id=" + idUsuarioTrabajo);
                });

        validarUsuarioActivo(usuarioTrabajo);
        validarAsignacionActiva(idActividad, idUsuarioTrabajo);

        // RN-015: Obtener valor hora histórico del cargo del usuario trabajado
        Cargo cargo = usuarioTrabajo.getCargo();
        if (cargo == null) {
            log.error("El usuario id={} no tiene cargo asociado, no se puede calcular valor hora histórico",
                    idUsuarioTrabajo);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El usuario no tiene cargo asociado. No se puede calcular el valor hora.");
        }
        if (cargo.getValorHora() == null) {
            log.error("El cargo id={} del usuario id={} no tiene valor hora definido", cargo.getId(), idUsuarioTrabajo);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El cargo del usuario no tiene valor hora definido. No se puede calcular el costo.");
        }

        BigDecimal valorHoraHistorico = cargo.getValorHora();
        // RN-016: costo_total = horas_trabajadas * valor_hora_historico
        BigDecimal costoTotal = dto.getHorasTrabajadas().multiply(valorHoraHistorico);

        log.info("Valor hora histórico aplicado: {} para usuario id={} cargo='{}'",
                valorHoraHistorico, idUsuarioTrabajo, cargo.getNombre());

        // Obtener usuario que registra (puede ser el mismo usuario o el líder)
        Usuario usuarioRegistra = usuarioRepository.findById(usuarioAutenticado.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "No se encontró el usuario autenticado"));

        LocalDateTime ahora = LocalDateTime.now();
        RegistroHoras registro = RegistroHoras.builder()
                .actividad(actividad)
                .usuario(usuarioTrabajo)
                .usuarioRegistra(usuarioRegistra)
                .fechaTrabajo(dto.getFechaTrabajo())
                .horasTrabajadas(dto.getHorasTrabajadas())
                .valorHoraHistorico(valorHoraHistorico)
                .costoTotal(costoTotal)
                .descripcion(dto.getDescripcion())
                .fechaCreacion(ahora)
                .fechaModificacion(ahora)
                .build();

        RegistroHoras guardado = registroHorasRepository.save(registro);
        log.info("Registro de horas creado id={} para actividad id={} usuario trabajado id={} "
                        + "horas={} valorHora={} costoTotal={} registrado por id={}",
                guardado.getId(), idActividad, idUsuarioTrabajo,
                dto.getHorasTrabajadas(), valorHoraHistorico, costoTotal,
                usuarioAutenticado.getId());

        return registroHorasMapper.toResponseDTO(guardado);
    }

    // -----------------------------------------------------------------------
    // Métodos auxiliares privados
    // -----------------------------------------------------------------------

    private Actividad buscarActividadPorId(Long idActividad) {
        return actividadRepository.findById(idActividad)
                .orElseThrow(() -> {
                    log.warn("Actividad no encontrada: id={}", idActividad);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Actividad no encontrada: id=" + idActividad);
                });
    }

    private void validarActividadNoEsCancelada(Actividad actividad) {
        if (actividad.getEstadoActividad() != null
                && CODIGO_ESTADO_ACTIVIDAD_CANCELADA.equals(actividad.getEstadoActividad().getCodigo())) {
            log.warn("Intento de registrar horas sobre actividad cancelada id={}", actividad.getId());
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No se pueden registrar horas sobre una actividad cancelada");
        }
    }

    private void validarProyectoNoEsCancelado(Actividad actividad) {
        if (actividad.getProyecto() != null
                && actividad.getProyecto().getEstadoProyecto() != null
                && CODIGO_ESTADO_PROYECTO_CANCELADO.equals(
                actividad.getProyecto().getEstadoProyecto().getCodigo())) {
            log.warn("Intento de registrar horas sobre actividad id={} de proyecto cancelado id={}",
                    actividad.getId(), actividad.getProyecto().getId());
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "No se pueden registrar horas sobre actividades de un proyecto cancelado");
        }
    }

    private void validarUsuarioActivo(Usuario usuario) {
        if (usuario.getEstadoUsuario() == null
                || !CODIGO_ESTADO_USUARIO_ACTIVO.equals(usuario.getEstadoUsuario().getCodigo())) {
            log.warn("Intento de registrar horas para usuario inactivo id={}", usuario.getId());
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El usuario no está activo: id=" + usuario.getId());
        }
    }

    private void validarAsignacionActiva(Long idActividad, Long idUsuario) {
        boolean tieneAsignacionActiva = asignacionRepository
                .existsByActividad_IdAndUsuario_IdAndEstadoAsignacion_Codigo(
                        idActividad, idUsuario, CODIGO_ESTADO_ASIGNACION_ACTIVA);
        if (!tieneAsignacionActiva) {
            log.warn("Intento de registrar horas sin asignación activa: actividad id={} usuario id={}",
                    idActividad, idUsuario);
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El usuario no tiene asignación activa en esta actividad");
        }
    }
}
