package com.unievt.service;

import com.unievt.dto.CreateEventRequest;
import com.unievt.dto.EventDTO;
import com.unievt.dto.InscriptionResponseDTO;
import com.unievt.entity.Club;
import com.unievt.entity.Evenement;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.CategorieEnum;
import com.unievt.enums.RoleEnum;
import com.unievt.enums.StatutEvenementEnum;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.mapper.InscriptionMapper;
import com.unievt.repository.ClubRepository;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.repository.UtilisateurRepository;
import com.unievt.security.CustomUserDetails;
import com.unievt.specification.EventSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApiEventService {

    private final EvenementRepository evenementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ClubRepository clubRepository;
    private final InscriptionMapper inscriptionMapper;

    public EventDTO create(CreateEventRequest req, CustomUserDetails currentUser) {
        if (req.getDateFin() != null && req.getDateDebut() != null
                && req.getDateFin().isBefore(req.getDateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin doit être postérieure à la date de début");
        }

        Utilisateur organisateur = utilisateurRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Evenement event = Evenement.builder()
                .titre(req.getTitre())
                .description(req.getDescription())
                .categorie(req.getCategorie())
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .capacite(req.getCapacite())
                .affiche(req.getAffiche())
                .visibilite(req.getVisibilite())
                .type(req.getType())
                .lienVisio(req.getLienVisio())
                .statut(StatutEvenementEnum.BROUILLON)
                .organisateur(organisateur)
                .build();

        if (req.getClubId() != null) {
            Club club = clubRepository.findById(req.getClubId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Club introuvable: " + req.getClubId()));
            event.setClub(club);
        }

        return toDTO(evenementRepository.save(event));
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> list(CategorieEnum categorie, StatutEvenementEnum statut,
                                LocalDateTime dateFrom, LocalDateTime dateTo, Pageable pageable) {
        EventSpecification spec = new EventSpecification(categorie, statut, dateFrom, dateTo);
        return evenementRepository.findAll(spec, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public EventDTO get(Long id) {
        return toDTO(getOrThrow(id));
    }

    public EventDTO update(Long id, CreateEventRequest req, CustomUserDetails currentUser) {
        Evenement event = getOrThrow(id);
        requireOrganizerOrAdmin(event, currentUser);

        if (req.getTitre() != null) event.setTitre(req.getTitre());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getCategorie() != null) event.setCategorie(req.getCategorie());
        if (req.getDateDebut() != null) event.setDateDebut(req.getDateDebut());
        if (req.getDateFin() != null) event.setDateFin(req.getDateFin());
        if (req.getCapacite() != null) event.setCapacite(req.getCapacite());
        if (req.getAffiche() != null) event.setAffiche(req.getAffiche());
        if (req.getVisibilite() != null) event.setVisibilite(req.getVisibilite());
        if (req.getType() != null) event.setType(req.getType());
        if (req.getLienVisio() != null) event.setLienVisio(req.getLienVisio());

        if (event.getDateFin() != null && event.getDateDebut() != null
                && event.getDateFin().isBefore(event.getDateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin doit être postérieure à la date de début");
        }

        return toDTO(evenementRepository.save(event));
    }

    public void delete(Long id, CustomUserDetails currentUser) {
        Evenement event = getOrThrow(id);
        requireOrganizerOrAdmin(event, currentUser);
        evenementRepository.deleteById(id);
    }

    public EventDTO publish(Long id, CustomUserDetails currentUser) {
        Evenement event = getOrThrow(id);
        requireOrganizerOrAdmin(event, currentUser);

        StatutEvenementEnum current = event.getStatut() != null
                ? event.getStatut() : StatutEvenementEnum.BROUILLON;

        // Organizer submits for review; admin directly approves
        if (isAdmin(currentUser)) {
            if (current != StatutEvenementEnum.VERIFIE && current != StatutEvenementEnum.RESERVATION_EN_ATTENTE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Publication (admin) autorisée uniquement depuis VERIFIE ou RESERVATION_EN_ATTENTE");
            }
            event.setStatut(StatutEvenementEnum.APPROUVE);
        } else {
            if (current != StatutEvenementEnum.BROUILLON) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Soumission autorisée uniquement depuis BROUILLON");
            }
            event.setStatut(StatutEvenementEnum.SOUMIS);
        }

        return toDTO(evenementRepository.save(event));
    }

    public EventDTO cancel(Long id, CustomUserDetails currentUser) {
        Evenement event = getOrThrow(id);
        requireOrganizerOrAdmin(event, currentUser);
        event.setStatut(StatutEvenementEnum.ANNULE);
        return toDTO(evenementRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<InscriptionResponseDTO> getRegistrations(Long id, CustomUserDetails currentUser) {
        Evenement event = getOrThrow(id);
        requireOrganizerOrAdmin(event, currentUser);
        return inscriptionRepository.findByEvenementId(id).stream()
                .map(inscriptionMapper::toResponseDTO)
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private EventDTO toDTO(Evenement e) {
        long count = inscriptionRepository.countByEvenementIdAndStatut(
                e.getId(), StatutInscriptionEnum.CONFIRMEE);
        return EventDTO.builder()
                .id(e.getId())
                .titre(e.getTitre())
                .description(e.getDescription())
                .categorie(e.getCategorie())
                .dateDebut(e.getDateDebut())
                .dateFin(e.getDateFin())
                .capacite(e.getCapacite())
                .registrationCount(count)
                .affiche(e.getAffiche())
                .statut(e.getStatut())
                .visibilite(e.getVisibilite())
                .type(e.getType())
                .lienVisio(e.getLienVisio())
                .organisateurId(e.getOrganisateur() != null ? e.getOrganisateur().getId() : null)
                .organisateurNom(e.getOrganisateur() != null
                        ? e.getOrganisateur().getPrenom() + " " + e.getOrganisateur().getNom() : null)
                .clubId(e.getClub() != null ? e.getClub().getId() : null)
                .clubNom(e.getClub() != null ? e.getClub().getNom() : null)
                .build();
    }

    private Evenement getOrThrow(Long id) {
        return evenementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + id));
    }

    private void requireOrganizerOrAdmin(Evenement event, CustomUserDetails currentUser) {
        boolean isOrganizer = event.getOrganisateur() != null
                && event.getOrganisateur().getId().equals(currentUser.getId());
        if (!isOrganizer && !isAdmin(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seul l'organisateur ou un administrateur peut effectuer cette action");
        }
    }

    private boolean isAdmin(CustomUserDetails user) {
        return user.getRole() == RoleEnum.ADMIN;
    }
}
