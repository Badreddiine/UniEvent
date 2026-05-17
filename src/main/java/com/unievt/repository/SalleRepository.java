package com.unievt.repository;

import com.unievt.enums.StatutSalleEnum;
import com.unievt.enums.TypeSalleEnum;
import com.unievt.entity.Salle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {

    List<Salle> findByStatut(StatutSalleEnum statut);
    List<Salle> findByType(TypeSalleEnum type);
    List<Salle> findByCapaciteGreaterThanEqual(Integer capaciteMin);
}
