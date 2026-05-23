package com.evm.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_registros_horas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroHoras {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_actividad", nullable = false)
    private Actividad actividad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_registra", nullable = false)
    private Usuario usuarioRegistra;

    @Column(name = "fecha_trabajo", nullable = false)
    private LocalDate fechaTrabajo;

    @Column(name = "horas_trabajadas", nullable = false, precision = 8, scale = 2)
    private BigDecimal horasTrabajadas;

    @Column(name = "valor_hora_historico", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorHoraHistorico;

    @Column(name = "costo_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal costoTotal;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
}
