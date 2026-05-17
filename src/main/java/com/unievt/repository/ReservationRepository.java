package com.unievt.repository;

import com.unievt.enums.StatutReservationEnum;
import com.unievt.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatut(StatutReservationEnum statut);
    List<Reservation> findByEvenementId(Long evenementId);
    List<Reservation> findBySalleId(Long salleId);
    List<Reservation> findByDemandeurId(Long demandeurId);
}
