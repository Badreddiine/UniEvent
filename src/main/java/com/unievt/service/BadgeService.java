package com.unievt.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.unievt.dto.BadgeDto;
import com.unievt.entity.Badge;
import com.unievt.entity.Inscription;
import com.unievt.enums.NotificationTypeEnum;
import com.unievt.repository.BadgeRepository;
import com.unievt.repository.InscriptionRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NotificationService notificationService;

    @PersistenceContext
    private EntityManager entityManager;

    /** Self-reference so {@link #createBadge} runs in its own (REQUIRES_NEW) transaction. */
    @Autowired
    @Lazy
    private BadgeService self;

    @Transactional
    public BadgeDto generateForRegistration(Long inscriptionId) {
        log.debug("generateForRegistration called for inscriptionId={}", inscriptionId);
        // Idempotent: if a badge already exists, return it instead of creating (and 409-ing) again.
        Optional<Badge> existing = badgeRepository.findByInscriptionId(inscriptionId);
        log.debug("existing badge found: {}", existing.isPresent());
        if (existing.isPresent()) {
            return toDto(existing.get());
        }

        // 404 if the registration itself doesn't exist
        boolean exists = inscriptionRepository.existsById(inscriptionId);
        log.debug("inscription exists: {}", exists);
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Inscription introuvable: " + inscriptionId);
        }

        // Drop any L1-cached (stale) Badge before delegating to the REQUIRES_NEW tx,
        // to avoid "detached entity passed to persist".
        entityManager.clear();
        try {
            log.debug("calling self.createBadge for inscriptionId={}", inscriptionId);
            BadgeDto result = self.createBadge(inscriptionId);
            log.debug("badge created successfully: {}", result);
            return result;
        } catch (DataIntegrityViolationException | OptimisticLockingFailureException e) {
            log.warn("Badge creation conflict for inscriptionId={}, reading existing: {}",
                inscriptionId, e.getMessage());
            // A concurrent request won the race — return the badge it created.
            return badgeRepository.findByInscriptionId(inscriptionId)
                    .map(this::toDto)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                            "Badge déjà existant pour cette inscription"));
        } catch (Exception e) {
            log.error("Unexpected error in generateForRegistration for inscriptionId={}: {}",
                inscriptionId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public BadgeDto verifyToken(UUID token) {
        Badge badge = badgeRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Badge invalide ou introuvable"));
        return toDto(badge);
    }

    /**
     * Validates the badge token and marks the linked registration as present.
     * Idempotent: checking in an already-present attendee is a no-op.
     */
    @Transactional
    public BadgeDto checkIn(UUID token) {
        Badge badge = badgeRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Badge invalide ou introuvable"));

        Inscription inscription = badge.getInscription();
        if (inscription != null && !Boolean.TRUE.equals(inscription.getPresent())) {
            inscription.setPresent(true);
            inscriptionRepository.save(inscription);
            log.info("Check-in: inscriptionId={} marked present via badge token={}",
                inscription.getId(), token);
        }
        return toDto(badge);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BadgeDto createBadge(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Inscription introuvable: " + inscriptionId));

        UUID badgeToken = UUID.randomUUID();

        String qrContent = buildQrContent(inscription, badgeToken);
        String qrBase64  = generateQrBase64(qrContent);

        Badge badge = Badge.builder()
                .id(badgeToken)
                .templateNom(resolveTemplateName(inscription))
                .qrData(qrBase64)
                .genereLe(LocalDateTime.now())
                .inscription(inscription)
                .evenement(inscription.getEvenement())
                .utilisateur(inscription.getEtudiant())
                .build();

        // persist works cleanly now that Badge.id is @Id only (no @GeneratedValue):
        // the manually-assigned UUID identifies a genuinely new row.
        // flush forces the INSERT now so any constraint violation surfaces in the
        // caller's try-catch.
        entityManager.persist(badge);
        entityManager.flush();
        Badge saved = badge;

        // Send badge-issued notification
        if (inscription.getEtudiant() != null) {
            try {
                String eventName = inscription.getEvenement() != null
                        ? inscription.getEvenement().getTitre() : "l'événement";
                notificationService.send(
                        inscription.getEtudiant().getId(),
                        NotificationTypeEnum.BADGE_ISSUED,
                        Map.of(
                            "eventName",  eventName,
                            "evenementId", inscription.getEvenement() != null
                                    ? inscription.getEvenement().getId() : 0L,
                            "qrImage",    qrBase64
                        )
                );
            } catch (Exception e) {
                log.warn("Could not send badge notification: {}", e.getMessage());
            }
        }

        return toDto(saved);
    }

    private String buildQrContent(Inscription inscription, UUID token) {
        Long eventId = inscription.getEvenement() != null ? inscription.getEvenement().getId() : null;
        Long userId  = inscription.getEtudiant()  != null ? inscription.getEtudiant().getId()  : null;
        return "{\"eventId\":" + eventId + ",\"userId\":" + userId
                + ",\"token\":\"" + token + "\"}";
    }

    private String generateQrBase64(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = Map.of(
                    EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M,
                    EncodeHintType.MARGIN, 2
            );
            BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300, hints);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (WriterException | IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du QR code");
        }
    }

    private String resolveTemplateName(Inscription inscription) {
        if (inscription.getEvenement() != null && inscription.getEvenement().getTitre() != null) {
            return inscription.getEvenement().getTitre() + " — Standard";
        }
        return "Badge Standard";
    }

    private BadgeDto toDto(Badge badge) {
        return BadgeDto.builder()
                .token(badge.getId())
                .templateNom(badge.getTemplateNom())
                .evenementId(badge.getEvenement() != null ? badge.getEvenement().getId() : null)
                .evenementTitre(badge.getEvenement() != null ? badge.getEvenement().getTitre() : null)
                .utilisateurId(badge.getUtilisateur() != null ? badge.getUtilisateur().getId() : null)
                .utilisateurNom(badge.getUtilisateur() != null
                        ? badge.getUtilisateur().getPrenom() + " " + badge.getUtilisateur().getNom() : null)
                .inscriptionId(badge.getInscription() != null ? badge.getInscription().getId() : null)
                .genereLe(badge.getGenereLe())
                .qrImage(badge.getQrData())
                .present(badge.getInscription() != null ? badge.getInscription().getPresent() : null)
                .build();
    }
}
