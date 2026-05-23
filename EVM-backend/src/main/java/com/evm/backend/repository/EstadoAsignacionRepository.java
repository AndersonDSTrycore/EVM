package com.evm.backend.repository;

import com.evm.backend.domain.EstadoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoAsignacionRepository extends JpaRepository<EstadoAsignacion, Long> {

    Optional<EstadoAsignacion> findByCodigo(String codigo);
}
