package com.unievt.service;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.NotificationResponseDTO;
import com.unievt.entity.Notification;
import com.unievt.entity.Utilisateur;
import com.unievt.mapper.NotificationMapper;
import com.unievt.repository.NotificationRepository;
import com.unievt.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationMapper notificationMapper;

    // ── Créer une notification ───────────────────────────────────────
    public NotificationResponseDTO creer(NotificationDTO dto) {
        Utilisateur destinataire = utilisateurRepository.findById(dto.getDestinataireId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + dto.getDestinataireId()));

        Notification notification = notificationMapper.toEntity(dto);
        notification.setDestinataire(destinataire);
        notification.setLu(false);

        return notificationMapper.toResponseDTO(notificationRepository.save(notification));
    }

    // ── Lister toutes les notifications d'un utilisateur ────────────
    public List<NotificationResponseDTO> listerParDestinataire(Long destinataireId) {
        return notificationRepository.findByDestinataireId(destinataireId)
                .stream()
                .map(notificationMapper::toResponseDTO)
                .toList();
    }

    // ── Lister les non lues d'un utilisateur ────────────────────────
    public List<NotificationResponseDTO> listerNonLues(Long destinataireId) {
        return notificationRepository.findByDestinataireIdAndLuFalse(destinataireId)
                .stream()
                .map(notificationMapper::toResponseDTO)
                .toList();
    }

    // ── Lire une notification par ID ─────────────────────────────────
    public NotificationResponseDTO lireParId(Long id) {
        return notificationMapper.toResponseDTO(trouverOuEchouer(id));
    }

    // ── Marquer comme lue (idempotent) ───────────────────────────────
    public NotificationResponseDTO marquerLue(Long id) {
        Notification notification = trouverOuEchouer(id);
        notification.setLu(true);
        return notificationMapper.toResponseDTO(notificationRepository.save(notification));
    }

    // ── Marquer toutes comme lues pour un utilisateur ────────────────
    public void marquerToutesLues(Long destinataireId) {
        List<Notification> nonLues = notificationRepository
                .findByDestinataireIdAndLuFalse(destinataireId);
        nonLues.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(nonLues);
    }

    // ── Supprimer une notification ───────────────────────────────────
    public void supprimer(Long id) {
        trouverOuEchouer(id);
        notificationRepository.deleteById(id);
    }

    // ── Utilitaire privé ─────────────────────────────────────────────
    private Notification trouverOuEchouer(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable : " + id));
    }
}
