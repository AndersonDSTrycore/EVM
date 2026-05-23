package com.evm.backend.service.impl;

import com.evm.backend.domain.Actividad;
import com.evm.backend.domain.Proyecto;
import com.evm.backend.dto.IndicadorEvmActividadDetalleDTO;
import com.evm.backend.dto.IndicadoresEvmActividadResponseDTO;
import com.evm.backend.dto.IndicadoresEvmProyectoResponseDTO;
import com.evm.backend.repository.ActividadRepository;
import com.evm.backend.repository.ProyectoRepository;
import com.evm.backend.repository.RegistroHorasRepository;
import com.evm.backend.service.IndicadorEvmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndicadorEvmServiceImpl implements IndicadorEvmService {

    private static final String CODIGO_CANCELADA = "CANCELADA";
    private static final BigDecimal CIEN = BigDecimal.valueOf(100);
    private static final BigDecimal LIMITE_RIESGO = new BigDecimal("0.90");

    private final ActividadRepository actividadRepository;
    private final RegistroHorasRepository registroHorasRepository;
    private final ProyectoRepository proyectoRepository;

    @Override
    @Transactional(readOnly = true)
    public IndicadoresEvmProyectoResponseDTO calcularIndicadoresProyecto(Long idProyecto, String filtro) {
        log.info("Calculando indicadores EVM para proyecto id={}, filtro='{}'", idProyecto, filtro);

        Proyecto proyecto = proyectoRepository.findById(idProyecto)
                .orElseThrow(() -> {
                    log.warn("Proyecto id={} no encontrado al calcular indicadores EVM", idProyecto);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Proyecto no encontrado");
                });

        List<Actividad> todas = actividadRepository.findByProyecto_Id(idProyecto);
        List<Actividad> activas = todas.stream()
                .filter(a -> !CODIGO_CANCELADA.equals(a.getEstadoActividad().getCodigo()))
                .toList();

        String filtroAplicado = null;
        List<Actividad> actividadesFiltradas = activas;

        if (filtro != null && !filtro.trim().isEmpty()) {
            filtroAplicado = filtro.trim();
            final String filtroNormalizado = filtroAplicado.toLowerCase();
            actividadesFiltradas = activas.stream()
                    .filter(a -> {
                        try {
                            Long idFiltro = Long.parseLong(filtroNormalizado);
                            return a.getId().equals(idFiltro);
                        } catch (NumberFormatException e) {
                            return a.getNombre().toLowerCase().contains(filtroNormalizado);
                        }
                    })
                    .toList();

            if (actividadesFiltradas.isEmpty()) {
                log.info("Filtro '{}' no encontró actividades activas para proyecto id={}. Retornando consolidado vacío.", filtroAplicado, idProyecto);
            }
        }

        // Cargar costos en una sola consulta para evitar N+1
        Map<Long, BigDecimal> costosPorActividad = obtenerCostosPorActividades(actividadesFiltradas);

        List<IndicadorEvmActividadDetalleDTO> detalles = actividadesFiltradas.stream()
                .map(a -> calcularDetalleActividad(a, costosPorActividad.getOrDefault(a.getId(), BigDecimal.ZERO)))
                .toList();

        BigDecimal bacTotal = detalles.stream()
                .map(IndicadorEvmActividadDetalleDTO::getBac)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pvTotal = detalles.stream()
                .map(IndicadorEvmActividadDetalleDTO::getPv)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal evTotal = detalles.stream()
                .map(IndicadorEvmActividadDetalleDTO::getEv)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal acTotal = detalles.stream()
                .map(IndicadorEvmActividadDetalleDTO::getAc)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cv = evTotal.subtract(acTotal);
        BigDecimal sv = evTotal.subtract(pvTotal);

        BigDecimal cpi = null;
        if (acTotal.compareTo(BigDecimal.ZERO) > 0) {
            cpi = evTotal.divide(acTotal, 4, RoundingMode.HALF_UP);
        } else {
            log.info("AC=0 para proyecto id={}. CPI no calculable.", idProyecto);
        }

        BigDecimal spi = null;
        if (pvTotal.compareTo(BigDecimal.ZERO) > 0) {
            spi = evTotal.divide(pvTotal, 4, RoundingMode.HALF_UP);
        } else {
            log.info("PV=0 para proyecto id={}. SPI no calculable.", idProyecto);
        }

        BigDecimal eac = null;
        BigDecimal vac = null;
        if (cpi != null && cpi.compareTo(BigDecimal.ZERO) != 0) {
            eac = bacTotal.divide(cpi, 2, RoundingMode.HALF_UP);
            vac = bacTotal.subtract(eac);
        } else if (cpi == null) {
            log.info("CPI nulo para proyecto id={}. EAC y VAC no calculables.", idProyecto);
        }

        log.info("Indicadores EVM consolidados proyecto id={}: BAC={}, PV={}, EV={}, AC={}, CPI={}, SPI={}",
                idProyecto, bacTotal, pvTotal, evTotal, acTotal, cpi, spi);

        return IndicadoresEvmProyectoResponseDTO.builder()
                .idProyecto(proyecto.getId())
                .nombreProyecto(proyecto.getNombre())
                .filtroAplicado(filtroAplicado)
                .cantidadActividades(detalles.size())
                .bac(bacTotal)
                .pv(pvTotal)
                .ev(evTotal)
                .ac(acTotal)
                .cv(cv)
                .sv(sv)
                .cpi(cpi)
                .spi(spi)
                .eac(eac)
                .vac(vac)
                .estadoCosto(determinarEstadoCosto(cpi))
                .estadoCronograma(determinarEstadoCronograma(spi))
                .interpretacionCosto(interpretarCpi(cpi, false))
                .interpretacionCronograma(interpretarSpi(spi, false))
                .actividades(detalles)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public IndicadoresEvmActividadResponseDTO calcularIndicadoresActividad(Long idActividad) {
        log.info("Calculando indicadores EVM para actividad id={}", idActividad);

        Actividad actividad = actividadRepository.findById(idActividad)
                .orElseThrow(() -> {
                    log.warn("Actividad id={} no encontrada al calcular indicadores EVM", idActividad);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Actividad no encontrada");
                });

        BigDecimal bac = actividad.getBac();
        BigDecimal pv = calcularPv(actividad.getPorcentajeAvancePlanificado(), bac);
        BigDecimal ev = calcularEv(actividad.getPorcentajeAvanceReal(), bac);
        BigDecimal ac = registroHorasRepository.sumarCostoTotalPorActividad(idActividad);

        BigDecimal cv = ev.subtract(ac);
        BigDecimal sv = ev.subtract(pv);

        BigDecimal cpi = null;
        if (ac.compareTo(BigDecimal.ZERO) > 0) {
            cpi = ev.divide(ac, 4, RoundingMode.HALF_UP);
        } else {
            log.info("AC=0 para actividad id={}. CPI no calculable.", idActividad);
        }

        BigDecimal spi = null;
        if (pv.compareTo(BigDecimal.ZERO) > 0) {
            spi = ev.divide(pv, 4, RoundingMode.HALF_UP);
        } else {
            log.info("PV=0 para actividad id={}. SPI no calculable.", idActividad);
        }

        BigDecimal eac = null;
        BigDecimal vac = null;
        if (cpi != null && cpi.compareTo(BigDecimal.ZERO) != 0) {
            eac = bac.divide(cpi, 2, RoundingMode.HALF_UP);
            vac = bac.subtract(eac);
        } else if (cpi == null) {
            log.info("CPI nulo para actividad id={}. EAC y VAC no calculables.", idActividad);
        }

        log.info("Indicadores EVM calculados actividad id={}: PV={}, EV={}, AC={}, CPI={}, SPI={}",
                idActividad, pv, ev, ac, cpi, spi);

        return IndicadoresEvmActividadResponseDTO.builder()
                .idActividad(actividad.getId())
                .nombreActividad(actividad.getNombre())
                .idProyecto(actividad.getProyecto().getId())
                .nombreProyecto(actividad.getProyecto().getNombre())
                .bac(bac)
                .pv(pv)
                .ev(ev)
                .ac(ac)
                .cv(cv)
                .sv(sv)
                .cpi(cpi)
                .spi(spi)
                .eac(eac)
                .vac(vac)
                .estadoCosto(determinarEstadoCosto(cpi))
                .estadoCronograma(determinarEstadoCronograma(spi))
                .interpretacionCosto(interpretarCpi(cpi, true))
                .interpretacionCronograma(interpretarSpi(spi, true))
                .build();
    }

    // --- Métodos privados de cálculo ---

    private IndicadorEvmActividadDetalleDTO calcularDetalleActividad(Actividad actividad, BigDecimal ac) {
        BigDecimal bac = actividad.getBac();
        BigDecimal pv = calcularPv(actividad.getPorcentajeAvancePlanificado(), bac);
        BigDecimal ev = calcularEv(actividad.getPorcentajeAvanceReal(), bac);

        BigDecimal cv = ev.subtract(ac);
        BigDecimal sv = ev.subtract(pv);

        BigDecimal cpi = null;
        if (ac.compareTo(BigDecimal.ZERO) > 0) {
            cpi = ev.divide(ac, 4, RoundingMode.HALF_UP);
        }

        BigDecimal spi = null;
        if (pv.compareTo(BigDecimal.ZERO) > 0) {
            spi = ev.divide(pv, 4, RoundingMode.HALF_UP);
        }

        return IndicadorEvmActividadDetalleDTO.builder()
                .idActividad(actividad.getId())
                .nombreActividad(actividad.getNombre())
                .bac(bac)
                .pv(pv)
                .ev(ev)
                .ac(ac)
                .cv(cv)
                .sv(sv)
                .cpi(cpi)
                .spi(spi)
                .estadoCosto(determinarEstadoCosto(cpi))
                .estadoCronograma(determinarEstadoCronograma(spi))
                .interpretacionCosto(interpretarCpi(cpi, true))
                .interpretacionCronograma(interpretarSpi(spi, true))
                .build();
    }

    private BigDecimal calcularPv(BigDecimal porcentajePlanificado, BigDecimal bac) {
        return porcentajePlanificado.divide(CIEN, 6, RoundingMode.HALF_UP)
                .multiply(bac)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularEv(BigDecimal porcentajeReal, BigDecimal bac) {
        return porcentajeReal.divide(CIEN, 6, RoundingMode.HALF_UP)
                .multiply(bac)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private Map<Long, BigDecimal> obtenerCostosPorActividades(List<Actividad> actividades) {
        Map<Long, BigDecimal> mapa = new HashMap<>();
        if (actividades.isEmpty()) {
            return mapa;
        }
        List<Long> ids = actividades.stream().map(Actividad::getId).toList();
        List<Object[]> resultados = registroHorasRepository.sumarCostoTotalPorActividades(ids);
        for (Object[] fila : resultados) {
            Long idActividad = (Long) fila[0];
            BigDecimal costo = (BigDecimal) fila[1];
            mapa.put(idActividad, costo);
        }
        return mapa;
    }

    private String determinarEstadoCosto(BigDecimal cpi) {
        if (cpi == null) return "SIN_DATOS";
        if (cpi.compareTo(BigDecimal.ONE) >= 0) return "BIEN";
        if (cpi.compareTo(LIMITE_RIESGO) >= 0) return "RIESGO";
        return "CRITICO";
    }

    private String determinarEstadoCronograma(BigDecimal spi) {
        if (spi == null) return "SIN_DATOS";
        if (spi.compareTo(BigDecimal.ONE) >= 0) return "BIEN";
        if (spi.compareTo(LIMITE_RIESGO) >= 0) return "RIESGO";
        return "CRITICO";
    }

    private String interpretarCpi(BigDecimal cpi, boolean esActividad) {
        String entidad = esActividad ? "La actividad" : "El proyecto";
        if (cpi == null) {
            return "No hay costo real registrado para calcular CPI.";
        }
        if (cpi.compareTo(BigDecimal.ONE) > 0) {
            return entidad + " está siendo eficiente en costos.";
        }
        if (cpi.compareTo(BigDecimal.ONE) == 0) {
            return entidad + " está en presupuesto.";
        }
        if (cpi.compareTo(LIMITE_RIESGO) >= 0) {
            return "Riesgo en costos.";
        }
        return entidad + " está sobre presupuesto. Estado crítico.";
    }

    private String interpretarSpi(BigDecimal spi, boolean esActividad) {
        String entidad = esActividad ? "La actividad" : "El proyecto";
        if (spi == null) {
            return "Sin avance planificado suficiente para calcular SPI.";
        }
        if (spi.compareTo(BigDecimal.ONE) > 0) {
            return entidad + " está adelantado frente al cronograma.";
        }
        if (spi.compareTo(BigDecimal.ONE) == 0) {
            return entidad + " está en cronograma.";
        }
        if (spi.compareTo(LIMITE_RIESGO) >= 0) {
            return "Riesgo en cronograma.";
        }
        return entidad + " está atrasado frente al avance planificado.";
    }
}
