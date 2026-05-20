package com.evm.backend.repository;

import com.evm.backend.domain.AsignacionActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionActividadRepository extends JpaRepository<AsignacionActividad, Long> {

    List<AsignacionActividad> findByActividad_Id(Long idActividad);

    List<AsignacionActividad> findByUsuario_Id(Long idUsuario);

    Optional<AsignacionActividad> findByActividad_IdAndUsuario_IdAndEstadoAsignacion_Codigo(
            Long idActividad, Long idUsuario, String codigoEstado);

    boolean existsByActividad_IdAndUsuario_IdAndEstadoAsignacion_Codigo(
            Long idActividad, Long idUsuario, String codigoEstado);

    @Query("""
            SELECT a.id FROM AsignacionActividad aa
            JOIN aa.actividad a
            WHERE aa.actividad.id = :idActividad
            AND aa.estadoAsignacion.codigo = 'ACTIVA'
            """)
    List<Long> findIdsUsuariosActivosEnActividad(@Param("idActividad") Long idActividad);

    @Query("""
            SELECT aa.usuario.id FROM AsignacionActividad aa
            WHERE aa.actividad.id = :idActividad
            AND aa.estadoAsignacion.codigo = 'ACTIVA'
            """)
    List<Long> findIdsUsuariosConAsignacionActiva(@Param("idActividad") Long idActividad);
}
