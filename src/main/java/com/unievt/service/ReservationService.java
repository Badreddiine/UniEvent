package com.unievt.service;

import com.unievt.dto.ReservationDTO;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.entity.Reservation;
import com.unievt.entity.Salle;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.StatutReservationEnum;
import com.unievt.mapper.ReservationMapper;
import com.unievt.repository.ReservationRepository;
import com.unievt.repository.SalleRepository;
import com.unievt.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final SalleRepository salleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ReservationMapper reservationMapper;

    // ── Créer une réservation ────────────────────────────────────────
    public ReservationResponseDTO creer(ReservationDTO dto) {
        Salle salle = salleRepository.findById(dto.getSalleId())
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable : " + dto.getSalleId()));

        Utilisateur demandeur = utilisateurRepository.findById(dto.getDemandeurId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + dto.getDemandeurId()));

        Reservation reservation = reservationMapper.toEntity(dto);
        reservation.setSalle(salle);
        reservation.setDemandeur(demandeur);
        reservation.setStatut(StatutReservationEnum.EN_ATTENTE);

        return reservationMapper.toResponseDTO(reservationRepository.save(reservation));
    }

    // ── Lister toutes les réservations ──────────────────────────────
    public List<ReservationResponseDTO> listerTout() {
        return reservationRepository.findAll()
                .stream()
                .map(reservationMapper::toResponseDTO)
                .toList();
    }

    // ── Lire une réservation par ID ──────────────────────────────────
    public ReservationResponseDTO lireParId(Long id) {
        return reservationMapper.toResponseDTO(trouverOuEchouer(id));
    }

    // ── Lister par demandeur ─────────────────────────────────────────
    public List<ReservationResponseDTO> listerParDemandeur(Long demandeurId) {
        return reservationRepository.findByDemandeurId(demandeurId)
                .stream()
                .map(reservationMapper::toResponseDTO)
                .toList();
    }

    // ── Lister par salle ─────────────────────────────────────────────
    public List<ReservationResponseDTO> listerParSalle(Long salleId) {
        return reservationRepository.findBySalleId(salleId)
                .stream()
                .map(reservationMapper::toResponseDTO)
                .toList();
    }

    // ── Approuver une réservation ────────────────────────────────────
    public ReservationResponseDTO approuver(Long id, Long approbateurId) {
        Reservation reservation = trouverOuEchouer(id);

        Utilisateur approbateur = utilisateurRepository.findById(approbateurId)
                .orElseThrow(() -> new EntityNotFoundException("Approbateur introuvable : " + approbateurId));

        reservation.setStatut(StatutReservationEnum.APPROUVEE);
        reservation.setApprobateur(approbateur);

        return reservationMapper.toResponseDTO(reservationRepository.save(reservation));
    }

    // ── Rejeter une réservation ──────────────────────────────────────
    public ReservationResponseDTO rejeter(Long id, Long approbateurId) {
        Reservation reservation = trouverOuEchouer(id);

        Utilisateur approbateur = utilisateurRepository.findById(approbateurId)
                .orElseThrow(() -> new EntityNotFoundException("Approbateur introuvable : " + approbateurId));

        reservation.setStatut(StatutReservationEnum.REJETEE);
        reservation.setApprobateur(approbateur);

        return reservationMapper.toResponseDTO(reservationRepository.save(reservation));
    }

    // ── Annuler une réservation ──────────────────────────────────────
    public ReservationResponseDTO annuler(Long id) {
        Reservation reservation = trouverOuEchouer(id);
        reservation.setStatut(StatutReservationEnum.ANNULEE);
        return reservationMapper.toResponseDTO(reservationRepository.save(reservation));
    }

    // ── Supprimer ────────────────────────────────────────────────────
    public void supprimer(Long id) {
        trouverOuEchouer(id);
        reservationRepository.deleteById(id);
    }

    // ── Utilitaire privé ─────────────────────────────────────────────
    private Reservation trouverOuEchouer(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Réservation introuvable : " + id));
    }
}
