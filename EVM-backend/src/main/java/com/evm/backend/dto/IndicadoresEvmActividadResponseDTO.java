package com.evm.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndicadoresEvmActividadResponseDTO {

    private Long idActividad;
    private String nombreActividad;
    private Long idProyecto;
    private String nombreProyecto;
    private BigDecimal bac;
    private BigDecimal pv;
    private BigDecimal ev;
    private BigDecimal ac;
    private BigDecimal cv;
    private BigDecimal sv;
    private BigDecimal cpi;
    private BigDecimal spi;
    private BigDecimal eac;
    private BigDecimal vac;
    private String estadoCosto;
    private String estadoCronograma;
    private String interpretacionCosto;
    private String interpretacionCronograma;
}
