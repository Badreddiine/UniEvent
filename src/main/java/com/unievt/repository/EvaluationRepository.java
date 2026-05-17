package com.unievt.repository;

import com.unievt.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByEtudiantId(Long etudiantId);
    List<Evaluation> findByReservationId(Long reservationId);
    List<Evaluation> findByReservationEvenementId(Long evenementId);
}
