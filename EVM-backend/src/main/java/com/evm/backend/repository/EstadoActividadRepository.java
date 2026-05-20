package com.evm.backend.repository;

import com.evm.backend.domain.EstadoActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoActividadRepository extends JpaRepository<EstadoActividad, Long> {

    Optional<EstadoActividad> findByCodigo(String codigo);
}
