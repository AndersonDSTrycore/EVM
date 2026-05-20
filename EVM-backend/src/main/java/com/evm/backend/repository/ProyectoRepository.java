package com.evm.backend.repository;

import com.evm.backend.domain.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {

    List<Proyecto> findByEstadoProyecto_Codigo(String codigoEstado);
}
