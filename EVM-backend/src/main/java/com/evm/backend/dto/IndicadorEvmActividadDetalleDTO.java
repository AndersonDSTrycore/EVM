package com.evm.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndicadorEvmActividadDetalleDTO {

    private Long idActividad;
    private String nombreActividad;
    private BigDecimal bac;
    private BigDecimal pv;
    private BigDecimal ev;
    private BigDecimal ac;
    private BigDecimal cv;
    private BigDecimal sv;
    private BigDecimal cpi;
    private BigDecimal spi;
    private String estadoCosto;
    private String estadoCronograma;
    private String interpretacionCosto;
    private String interpretacionCronograma;
}
