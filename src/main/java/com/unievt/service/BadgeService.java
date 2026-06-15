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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NotificationService notificationService;

    @Transactional
    public BadgeDto generateForRegistration(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Inscription introuvable: " + inscriptionId));

        // Return existing badge if already generated
        return badgeRepository.findByInscriptionId(inscriptionId)
                .map(this::toDto)
                .orElseGet(() -> createBadge(inscription));
    }

    @Transactional(readOnly = true)
    public BadgeDto verifyToken(UUID token) {
        Badge badge = badgeRepository.findById(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Badge invalide ou introuvable"));
        return toDto(badge);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private BadgeDto createBadge(Inscription inscription) {
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

        Badge saved = badgeRepository.save(badge);

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
                .build();
    }
}
