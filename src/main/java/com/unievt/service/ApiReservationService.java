package com.unievt.service;

import com.unievt.dto.CreateReservationRequest;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.dto.RoomDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Reservation;
import com.unievt.entity.Salle;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.StatutReservationEnum;
import com.unievt.exception.ConflictException;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.ReservationRepository;
import com.unievt.repository.SalleRepository;
import com.unievt.repository.UtilisateurRepository;
import com.unievt.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApiReservationService {

    private final ReservationRepository reservationRepository;
    private final SalleRepository salleRepository;
    private final EvenementRepository evenementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ReservationResponseDTO create(CreateReservationRequest req, CustomUserDetails currentUser) {
        if (req.getDateFin().isBefore(req.getDateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin doit être postérieure à la date de début");
        }

        Salle salle = salleRepository.findById(req.getSalleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Salle introuvable: " + req.getSalleId()));

        Evenement evenement = evenementRepository.findById(req.getEvenementId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + req.getEvenementId()));

        // Capacity check
        if (salle.getCapacite() != null && evenement.getCapacite() != null
                && evenement.getCapacite() > salle.getCapacite()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La capacité de la salle (" + salle.getCapacite()
                            + ") est insuffisante pour l'événement (" + evenement.getCapacite() + " attendus)");
        }

        // Overlap check
        List<Reservation> overlapping = reservationRepository.findOverlapping(
                req.getSalleId(), req.getDateDebut(), req.getDateFin());
        if (!overlapping.isEmpty()) {
            throw new ConflictException(
                    "La salle est déjà réservée sur ce créneau (" + overlapping.size() + " conflit(s))");
        }

        Utilisateur demandeur = utilisateurRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Reservation reservation = Reservation.builder()
                .salle(salle)
                .evenement(evenement)
                .demandeur(demandeur)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .commentaire(req.getCommentaire())
                .statut(StatutReservationEnum.EN_ATTENTE)
                .build();

        return toDTO(reservationRepository.save(reservation));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> listForCurrentUser(CustomUserDetails currentUser) {
        return reservationRepository.findByDemandeurId(currentUser.getId()).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> listForEvent(Long evenementId) {
        return reservationRepository.findByEvenementId(evenementId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReservationResponseDTO get(Long id, CustomUserDetails currentUser) {
        Reservation r = getOrThrow(id);
        requireOwnerOrAdmin(r, currentUser);
        return toDTO(r);
    }

    public void cancel(Long id, CustomUserDetails currentUser) {
        Reservation r = getOrThrow(id);
        requireOwnerOrAdmin(r, currentUser);
        r.setStatut(StatutReservationEnum.ANNULEE);
        reservationRepository.save(r);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> listAll() {
        return reservationRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public ReservationResponseDTO approve(Long id, CustomUserDetails currentUser) {
        Reservation r = getOrThrow(id);
        Utilisateur approbateur = utilisateurRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        r.setStatut(StatutReservationEnum.APPROUVEE);
        r.setApprobateur(approbateur);
        return toDTO(reservationRepository.save(r));
    }

    public ReservationResponseDTO reject(Long id, CustomUserDetails currentUser) {
        Reservation r = getOrThrow(id);
        Utilisateur approbateur = utilisateurRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        r.setStatut(StatutReservationEnum.REJETEE);
        r.setApprobateur(approbateur);
        return toDTO(reservationRepository.save(r));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ReservationResponseDTO toDTO(Reservation r) {
        RoomDTO salleDto = r.getSalle() != null ? toRoomDTO(r.getSalle()) : null;
        return ReservationResponseDTO.builder()
                .id(r.getId())
                .dateDebut(r.getDateDebut())
                .dateFin(r.getDateFin())
                .statut(r.getStatut())
                .commentaire(r.getCommentaire())
                .dateCreation(r.getDateCreation())
                .evenementId(r.getEvenement() != null ? r.getEvenement().getId() : null)
                .evenementTitre(r.getEvenement() != null ? r.getEvenement().getTitre() : null)
                .salleId(r.getSalle() != null ? r.getSalle().getId() : null)
                .salleNom(r.getSalle() != null ? r.getSalle().getNom() : null)
                .demandeurId(r.getDemandeur() != null ? r.getDemandeur().getId() : null)
                .demandeurNom(r.getDemandeur() != null ? r.getDemandeur().getNom() : null)
                .demandeurPrenom(r.getDemandeur() != null ? r.getDemandeur().getPrenom() : null)
                .approbateurId(r.getApprobateur() != null ? r.getApprobateur().getId() : null)
                .approbateurNom(r.getApprobateur() != null ? r.getApprobateur().getNom() : null)
                .build();
    }

    private RoomDTO toRoomDTO(Salle s) {
        return RoomDTO.builder()
                .id(s.getId())
                .nom(s.getNom())
                .batiment(s.getBatiment())
                .etage(s.getEtage())
                .capacite(s.getCapacite())
                .type(s.getType())
                .equipements(s.getEquipements())
                .accessiblePMR(s.getAccessiblePMR())
                .statut(s.getStatut())
                .photos(s.getPhotos())
                .build();
    }

    private Reservation getOrThrow(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Réservation introuvable: " + id));
    }

    private void requireOwnerOrAdmin(Reservation r, CustomUserDetails currentUser) {
        boolean isOwner = r.getDemandeur() != null
                && r.getDemandeur().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() != null
                && currentUser.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès non autorisé à cette réservation");
        }
    }

    // ── rooms ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RoomDTO> listRooms(LocalDateTime dateDebut, LocalDateTime dateFin, Integer minCapacity) {
        return salleRepository.findAll().stream()
                .filter(s -> minCapacity == null || (s.getCapacite() != null && s.getCapacite() >= minCapacity))
                .filter(s -> {
                    if (dateDebut == null || dateFin == null) return true;
                    List<Reservation> overlaps = reservationRepository.findOverlapping(s.getId(), dateDebut, dateFin);
                    return overlaps.isEmpty();
                })
                .map(this::toRoomDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomDTO getRoom(Long id) {
        return toRoomDTO(salleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable: " + id)));
    }
}
