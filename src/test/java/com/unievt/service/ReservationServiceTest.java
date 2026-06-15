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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock ReservationRepository reservationRepository;
    @Mock SalleRepository salleRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock ReservationMapper reservationMapper;

    @InjectMocks ReservationService reservationService;

    private Salle salle;
    private Utilisateur demandeur;
    private Utilisateur approbateur;
    private Reservation reservation;
    private ReservationResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        salle = Salle.builder().id(1L).nom("Amphi A").build();
        demandeur = Utilisateur.builder().id(2L).nom("Demandeur").build();
        approbateur = Utilisateur.builder().id(3L).nom("Doyen").build();

        reservation = Reservation.builder()
                .id(10L).salle(salle).demandeur(demandeur)
                .statut(StatutReservationEnum.EN_ATTENTE).build();

        responseDTO = new ReservationResponseDTO();
        responseDTO.setId(10L);
        responseDTO.setStatut(StatutReservationEnum.EN_ATTENTE);
    }

    @Test
    void creer_setsStatutEnAttenteAndSaves() {
        ReservationDTO dto = ReservationDTO.builder()
                .salleId(1L).demandeurId(2L).commentaire("Besoin pour conf").build();

        when(salleRepository.findById(1L)).thenReturn(Optional.of(salle));
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(demandeur));
        when(reservationMapper.toEntity(dto)).thenReturn(reservation);
        when(reservationRepository.save(any())).thenReturn(reservation);
        when(reservationMapper.toResponseDTO(reservation)).thenReturn(responseDTO);

        ReservationResponseDTO result = reservationService.creer(dto);

        assertThat(reservation.getStatut()).isEqualTo(StatutReservationEnum.EN_ATTENTE);
        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    void creer_throwsEntityNotFound_whenSalleMissing() {
        ReservationDTO dto = ReservationDTO.builder().salleId(99L).demandeurId(2L).build();
        when(salleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.creer(dto))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Salle");
    }

    @Test
    void creer_throwsEntityNotFound_whenDemandeurMissing() {
        ReservationDTO dto = ReservationDTO.builder().salleId(1L).demandeurId(99L).build();
        when(salleRepository.findById(1L)).thenReturn(Optional.of(salle));
        when(utilisateurRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.creer(dto))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Utilisateur");
    }

    @Test
    void approuver_setsStatutApprouveeAndApprobateur() {
        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));
        when(utilisateurRepository.findById(3L)).thenReturn(Optional.of(approbateur));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(reservationMapper.toResponseDTO(reservation)).thenReturn(responseDTO);

        reservationService.approuver(10L, 3L);

        assertThat(reservation.getStatut()).isEqualTo(StatutReservationEnum.APPROUVEE);
        assertThat(reservation.getApprobateur()).isEqualTo(approbateur);
    }

    @Test
    void rejeter_setsStatutRejetee() {
        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));
        when(utilisateurRepository.findById(3L)).thenReturn(Optional.of(approbateur));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(reservationMapper.toResponseDTO(reservation)).thenReturn(responseDTO);

        reservationService.rejeter(10L, 3L);

        assertThat(reservation.getStatut()).isEqualTo(StatutReservationEnum.REJETEE);
    }

    @Test
    void annuler_setsStatutAnnulee() {
        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(reservationMapper.toResponseDTO(reservation)).thenReturn(responseDTO);

        reservationService.annuler(10L);

        assertThat(reservation.getStatut()).isEqualTo(StatutReservationEnum.ANNULEE);
    }

    @Test
    void lireParId_throwsEntityNotFound_whenMissing() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.lireParId(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void supprimer_deletesWhenFound() {
        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));

        reservationService.supprimer(10L);

        verify(reservationRepository).deleteById(10L);
    }

    @Test
    void listerParDemandeur_returnsFiltered() {
        when(reservationRepository.findByDemandeurId(2L)).thenReturn(List.of(reservation));
        when(reservationMapper.toResponseDTO(reservation)).thenReturn(responseDTO);

        List<ReservationResponseDTO> result = reservationService.listerParDemandeur(2L);
        assertThat(result).hasSize(1);
    }
}
