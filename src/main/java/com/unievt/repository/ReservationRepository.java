package com.unievt.repository;

import com.unievt.entity.Reservation;
import com.unievt.enums.StatutReservationEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatut(StatutReservationEnum statut);
    List<Reservation> findByEvenementId(Long evenementId);
    List<Reservation> findBySalleId(Long salleId);
    List<Reservation> findByDemandeurId(Long demandeurId);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.salle.id = :salleId
          AND r.statut != com.unievt.enums.StatutReservationEnum.ANNULEE
          AND r.dateDebut < :dateFin
          AND r.dateFin > :dateDebut
    """)
    List<Reservation> findOverlapping(@Param("salleId") Long salleId,
                                      @Param("dateDebut") LocalDateTime dateDebut,
                                      @Param("dateFin") LocalDateTime dateFin);

    // ── Analytics ─────────────────────────────────────────────────────────────

    /**
     * Per-room utilization stats.
     * Columns: id_salle, nom, total_reservations, approved_hours, total_requested_hours
     */
    @Query(value = """
        SELECT
            s.id_salle,
            s.nom,
            COUNT(r.id_reservation)                                           AS total_reservations,
            COALESCE(SUM(CASE WHEN r.statut = 'APPROUVEE'
                THEN EXTRACT(EPOCH FROM (r.date_fin - r.date_debut)) / 3600
                ELSE 0 END), 0)                                               AS approved_hours,
            COALESCE(SUM(
                EXTRACT(EPOCH FROM (r.date_fin - r.date_debut)) / 3600
            ), 0)                                                             AS total_requested_hours
        FROM salle s
        LEFT JOIN reservation r
               ON r.id_salle = s.id_salle AND r.statut != 'ANNULEE'
        GROUP BY s.id_salle, s.nom
        ORDER BY s.nom
        """, nativeQuery = true)
    List<Object[]> roomUtilizationStats();

    /**
     * Approved reservation hours for a specific event's room(s).
     * Columns: id_salle, nom, approved_hours
     */
    @Query(value = """
        SELECT
            s.id_salle,
            s.nom,
            COALESCE(SUM(
                EXTRACT(EPOCH FROM (r.date_fin - r.date_debut)) / 3600
            ), 0) AS approved_hours
        FROM reservation r
        JOIN salle s ON r.id_salle = s.id_salle
        WHERE r.id_evenement = :eventId
          AND r.statut = 'APPROUVEE'
        GROUP BY s.id_salle, s.nom
        """, nativeQuery = true)
    List<Object[]> approvedHoursByRoom(@Param("eventId") Long eventId);
}
