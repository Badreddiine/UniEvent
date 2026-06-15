package com.unievt.repository;

import com.unievt.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUtilisateurId(Long utilisateurId);

    void deleteByToken(String token);

    void deleteByUtilisateurId(Long utilisateurId);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.utilisateur.id = :userId")
    void revokeAllByUtilisateurId(@Param("userId") Long userId);
}
