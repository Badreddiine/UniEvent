package com.unievt.service;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.NotificationResponseDTO;
import com.unievt.entity.Notification;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.NotificationTypeEnum;
import com.unievt.enums.TypeNotifEnum;
import com.unievt.mapper.NotificationMapper;
import com.unievt.repository.NotificationRepository;
import com.unievt.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;

    // ── Higher-level send API ─────────────────────────────────────────────────

    /**
     * Persists a notification to the DB and sends an async email when applicable.
     * {@code payload} keys are passed directly to the Thymeleaf email template.
     */
    @Transactional
    public NotificationResponseDTO send(Long userId, NotificationTypeEnum type, Map<String, Object> payload) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable: " + userId));

        String titre   = resolveTitre(type);
        String message = resolveMessage(type, payload);

        Long evenementId = payload.get("evenementId") instanceof Long l ? l : null;

        Notification notification = Notification.builder()
                .titre(titre)
                .message(message)
                .type(TypeNotifEnum.PUSH)
                .notificationType(type)
                .destinataire(user)
                .lu(false)
                .build();

        if (evenementId != null) {
            // lazy lookup of evenement is handled by mapper — just set id for now
            // We rely on creer(dto) which already handles this; reuse below
        }

        Notification saved = notificationRepository.save(notification);

        // Send email asynchronously if user has an email address
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            Map<String, Object> templateVars = new HashMap<>(payload);
            templateVars.put("userName", user.getPrenom() + " " + user.getNom());
            templateVars.put("message", message);
            emailService.sendNotificationEmail(user.getEmail(), titre, type, templateVars);
        }

        return notificationMapper.toResponseDTO(saved);
    }

    // ── Legacy lower-level API (keep for backward-compat) ────────────────────

    @Transactional
    public NotificationResponseDTO creer(NotificationDTO dto) {
        Utilisateur destinataire = utilisateurRepository.findById(dto.getDestinataireId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Utilisateur introuvable : " + dto.getDestinataireId()));

        Notification notification = notificationMapper.toEntity(dto);
        notification.setDestinataire(destinataire);
        notification.setLu(false);

        return notificationMapper.toResponseDTO(notificationRepository.save(notification));
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> listerParDestinatairePage(Long destinataireId, Pageable pageable) {
        return notificationRepository
                .findByDestinataireIdOrderByDateEnvoiDesc(destinataireId, pageable)
                .map(notificationMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> listerParDestinataire(Long destinataireId) {
        return notificationRepository.findByDestinataireId(destinataireId)
                .stream().map(notificationMapper::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> listerNonLues(Long destinataireId) {
        return notificationRepository.findByDestinataireIdAndLuFalse(destinataireId)
                .stream().map(notificationMapper::toResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public NotificationResponseDTO lireParId(Long id) {
        return notificationMapper.toResponseDTO(trouverOuEchouer(id));
    }

    @Transactional
    public NotificationResponseDTO marquerLue(Long id) {
        Notification notification = trouverOuEchouer(id);
        notification.setLu(true);
        return notificationMapper.toResponseDTO(notificationRepository.save(notification));
    }

    @Transactional
    public void marquerToutesLues(Long destinataireId) {
        notificationRepository.markAllReadByUserId(destinataireId);
    }

    @Transactional
    public void supprimer(Long id) {
        trouverOuEchouer(id);
        notificationRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Notification trouverOuEchouer(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable : " + id));
    }

    private String resolveTitre(NotificationTypeEnum type) {
        return switch (type) {
            case REGISTRATION_CONFIRMED -> "Inscription confirmée";
            case EVENT_REMINDER         -> "Rappel d'événement — dans 24h";
            case EVENT_CANCELLED        -> "Événement annulé";
            case WAITLIST_PROMOTED      -> "Vous êtes inscrit — place disponible";
            case BADGE_ISSUED           -> "Badge généré";
        };
    }

    private String resolveMessage(NotificationTypeEnum type, Map<String, Object> payload) {
        String eventName = String.valueOf(payload.getOrDefault("eventName", "l'événement"));
        return switch (type) {
            case REGISTRATION_CONFIRMED -> "Votre inscription à « " + eventName + " » est confirmée.";
            case EVENT_REMINDER         -> "L'événement « " + eventName + " » commence dans 24 heures.";
            case EVENT_CANCELLED        -> "L'événement « " + eventName + " » a été annulé.";
            case WAITLIST_PROMOTED      -> "Une place s'est libérée pour « " + eventName + " ». Vous êtes maintenant inscrit.";
            case BADGE_ISSUED           -> "Votre badge pour « " + eventName + " » est disponible.";
        };
    }
}
