package com.unievt.service;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.RegistrationDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Inscription;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.RoleEnum;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.enums.TypeNotifEnum;
import com.unievt.event.WaitlistPromotionEvent;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.repository.UtilisateurRepository;
import com.unievt.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationService {

    private final InscriptionRepository inscriptionRepository;
    private final EvenementRepository evenementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    public RegistrationDTO register(Long evenementId, CustomUserDetails currentUser) {
        Evenement evenement = getEventOrThrow(evenementId);
        Utilisateur etudiant = getUserOrThrow(currentUser.getId());

        // Duplicate check
        inscriptionRepository.findByEtudiantIdAndEvenementId(currentUser.getId(), evenementId)
                .ifPresent(existing -> {
                    if (existing.getStatut() != StatutInscriptionEnum.ANNULEE) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Vous êtes déjà inscrit à cet événement");
                    }
                });

        // Capacity check
        long confirmed = inscriptionRepository.countByEvenementIdAndStatut(
                evenementId, StatutInscriptionEnum.CONFIRMEE);
        boolean isFull = evenement.getCapacite() != null && confirmed >= evenement.getCapacite();

        StatutInscriptionEnum statut = isFull
                ? StatutInscriptionEnum.LISTE_ATTENTE
                : StatutInscriptionEnum.CONFIRMEE;

        Inscription inscription = Inscription.builder()
                .evenement(evenement)
                .etudiant(etudiant)
                .dateInscription(LocalDateTime.now())
                .statut(statut)
                .qrCode(statut == StatutInscriptionEnum.CONFIRMEE ? UUID.randomUUID().toString() : null)
                .present(false)
                .build();

        Inscription saved = inscriptionRepository.save(inscription);

        // Confirmation notification
        String titre = statut == StatutInscriptionEnum.CONFIRMEE
                ? "Inscription confirmée"
                : "Inscription en liste d'attente";
        String message = statut == StatutInscriptionEnum.CONFIRMEE
                ? "Votre inscription à \"" + evenement.getTitre() + "\" est confirmée."
                : "Vous êtes sur liste d'attente pour \"" + evenement.getTitre() + "\". Vous serez notifié si une place se libère.";

        notificationService.creer(NotificationDTO.builder()
                .titre(titre)
                .message(message)
                .type(TypeNotifEnum.PUSH)
                .destinataireId(currentUser.getId())
                .evenementId(evenementId)
                .build());

        return toDTO(saved);
    }

    public void cancel(Long evenementId, CustomUserDetails currentUser) {
        Inscription inscription = inscriptionRepository
                .findByEtudiantIdAndEvenementId(currentUser.getId(), evenementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucune inscription trouvée pour cet événement"));

        if (inscription.getStatut() == StatutInscriptionEnum.ANNULEE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cette inscription est déjà annulée");
        }

        boolean wasConfirmed = inscription.getStatut() == StatutInscriptionEnum.CONFIRMEE;
        inscription.setStatut(StatutInscriptionEnum.ANNULEE);
        inscriptionRepository.save(inscription);

        // Trigger waitlist promotion if a confirmed spot opened up
        if (wasConfirmed) {
            eventPublisher.publishEvent(new WaitlistPromotionEvent(this, evenementId));
        }
    }

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getAttendees(Long evenementId, CustomUserDetails currentUser) {
        Evenement evenement = getEventOrThrow(evenementId);
        requireOrganizerOrAdmin(evenement, currentUser);
        return inscriptionRepository.findByEvenementId(evenementId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getMyRegistrations(CustomUserDetails currentUser) {
        return inscriptionRepository.findByEtudiantId(currentUser.getId()).stream()
                .map(this::toDTO)
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private RegistrationDTO toDTO(Inscription i) {
        return RegistrationDTO.builder()
                .id(i.getId())
                .evenementId(i.getEvenement() != null ? i.getEvenement().getId() : null)
                .evenementTitre(i.getEvenement() != null ? i.getEvenement().getTitre() : null)
                .etudiantId(i.getEtudiant() != null ? i.getEtudiant().getId() : null)
                .etudiantNom(i.getEtudiant() != null
                        ? i.getEtudiant().getPrenom() + " " + i.getEtudiant().getNom() : null)
                .statut(i.getStatut())
                .dateInscription(i.getDateInscription())
                .qrCode(i.getQrCode())
                .present(i.getPresent())
                .build();
    }

    private Evenement getEventOrThrow(Long id) {
        return evenementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + id));
    }

    private Utilisateur getUserOrThrow(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable: " + id));
    }

    private void requireOrganizerOrAdmin(Evenement event, CustomUserDetails currentUser) {
        boolean isOrganizer = event.getOrganisateur() != null
                && event.getOrganisateur().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == RoleEnum.ADMIN;
        if (!isOrganizer && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seul l'organisateur ou un administrateur peut accéder à cette liste");
        }
    }
}
