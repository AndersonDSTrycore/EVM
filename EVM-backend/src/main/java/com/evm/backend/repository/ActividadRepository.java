package com.evm.backend.repository;

import com.evm.backend.domain.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    List<Actividad> findByProyecto_Id(Long idProyecto);

    List<Actividad> findByProyecto_IdAndEstadoActividad_Codigo(Long idProyecto, String codigoEstado);

    @Query("SELECT COALESCE(SUM(a.bac), 0) FROM Actividad a WHERE a.proyecto.id = :idProyecto AND a.estadoActividad.codigo <> 'CANCELADA'")
    BigDecimal sumarBacNoCanceladas(@Param("idProyecto") Long idProyecto);

    @Query("SELECT COALESCE(SUM(a.bac), 0) FROM Actividad a WHERE a.proyecto.id = :idProyecto AND a.estadoActividad.codigo <> 'CANCELADA' AND a.id <> :idActividad")
    BigDecimal sumarBacNoCanceladasExcluyendo(@Param("idProyecto") Long idProyecto, @Param("idActividad") Long idActividad);
}
