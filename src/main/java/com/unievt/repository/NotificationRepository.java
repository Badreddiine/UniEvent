package com.unievt.repository;

import com.unievt.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataireId(Long destinataireId);
    List<Notification> findByDestinataireIdAndLuFalse(Long destinataireId);
    List<Notification> findByEvenementId(Long evenementId);

    Page<Notification> findByDestinataireIdOrderByDateEnvoiDesc(Long destinataireId, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.lu = true WHERE n.destinataire.id = :userId AND n.lu = false")
    int markAllReadByUserId(@Param("userId") Long userId);
}
