package com.evm.backend.repository;

import com.evm.backend.domain.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {

    List<Cargo> findByActivoTrue();
}
