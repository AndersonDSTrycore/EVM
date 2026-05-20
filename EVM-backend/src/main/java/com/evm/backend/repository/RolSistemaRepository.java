package com.evm.backend.repository;

import com.evm.backend.domain.RolSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolSistemaRepository extends JpaRepository<RolSistema, Long> {

    Optional<RolSistema> findByCodigo(String codigo);
}
