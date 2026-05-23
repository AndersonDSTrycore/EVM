package com.evm.backend.repository;

import com.evm.backend.domain.EstadoProyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoProyectoRepository extends JpaRepository<EstadoProyecto, Long> {

    Optional<EstadoProyecto> findByCodigo(String codigo);
}
