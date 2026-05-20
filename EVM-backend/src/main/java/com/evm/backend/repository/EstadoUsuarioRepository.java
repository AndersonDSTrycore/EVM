package com.evm.backend.repository;

import com.evm.backend.domain.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoUsuarioRepository extends JpaRepository<EstadoUsuario, Long> {

    Optional<EstadoUsuario> findByCodigo(String codigo);
}
