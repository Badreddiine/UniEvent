package com.unievt.repository;

import com.unievt.entity.Sponsor;
import com.unievt.enums.NiveauSponsorEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, UUID> {

    List<Sponsor> findByEvenementId(Long evenementId);

    @Query("""
        SELECT s FROM Sponsor s
        WHERE s.evenement.id = :evenementId
        ORDER BY s.niveau ASC, s.displayOrder ASC
    """)
    List<Sponsor> findByEvenementIdOrderByTier(@Param("evenementId") Long evenementId);

    List<Sponsor> findByPartenaireId(UUID partenaireId);

    List<Sponsor> findByNiveau(NiveauSponsorEnum niveau);

    boolean existsByPartenaireIdAndEvenementId(UUID partenaireId, Long evenementId);

    Optional<Sponsor> findByPartenaireIdAndEvenementId(UUID partenaireId, Long evenementId);
}
