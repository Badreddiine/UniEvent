package com.unievt.repository;

import com.unievt.entity.Inscription;
import com.unievt.enums.StatutInscriptionEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByEvenementId(Long evenementId);
    List<Inscription> findByEtudiantId(Long etudiantId);
    List<Inscription> findByEvenementIdAndStatut(Long evenementId, StatutInscriptionEnum statut);

    long countByEvenementIdAndStatut(Long evenementId, StatutInscriptionEnum statut);

    Optional<Inscription> findFirstByEvenementIdAndStatutOrderByDateInscriptionAsc(
            Long evenementId, StatutInscriptionEnum statut);

    Optional<Inscription> findByEtudiantIdAndEvenementId(Long etudiantId, Long evenementId);

    // ── Analytics ─────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.statut != com.unievt.enums.StatutInscriptionEnum.ANNULEE")
    long countActive();

    /**
     * Daily registration counts in a date window.
     * Returns Object[]{java.sql.Date day, Long count}.
     */
    @Query(value = """
        SELECT DATE(date_inscription) AS day, COUNT(*) AS cnt
        FROM inscription
        WHERE date_inscription BETWEEN :from AND :to
        GROUP BY DATE(date_inscription)
        ORDER BY day
        """, nativeQuery = true)
    List<Object[]> countByDay(@Param("from") LocalDateTime from,
                               @Param("to") LocalDateTime to);

    /**
     * Daily registration counts for one event.
     * Returns Object[]{java.sql.Date day, Long count}.
     */
    @Query(value = """
        SELECT DATE(date_inscription) AS day, COUNT(*) AS cnt
        FROM inscription
        WHERE id_evenement = :eventId
        GROUP BY DATE(date_inscription)
        ORDER BY day
        """, nativeQuery = true)
    List<Object[]> countByDayForEvent(@Param("eventId") Long eventId);
}
