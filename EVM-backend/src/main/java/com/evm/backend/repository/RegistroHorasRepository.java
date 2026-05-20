package com.evm.backend.repository;

import com.evm.backend.domain.RegistroHoras;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RegistroHorasRepository extends JpaRepository<RegistroHoras, Long> {

    List<RegistroHoras> findByActividad_Id(Long idActividad);

    List<RegistroHoras> findByUsuario_Id(Long idUsuario);

    List<RegistroHoras> findByActividad_Proyecto_Id(Long idProyecto);

    @Query("SELECT COALESCE(SUM(r.costoTotal), 0) FROM RegistroHoras r WHERE r.actividad.id = :idActividad")
    BigDecimal sumarCostoTotalPorActividad(@Param("idActividad") Long idActividad);

    @Query("SELECT r.actividad.id, COALESCE(SUM(r.costoTotal), 0) FROM RegistroHoras r " +
           "WHERE r.actividad.id IN :ids GROUP BY r.actividad.id")
    List<Object[]> sumarCostoTotalPorActividades(@Param("ids") List<Long> ids);
}
