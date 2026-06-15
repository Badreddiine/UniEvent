package com.unievt.service;

import com.unievt.dto.InscriptionCreateDTO;
import com.unievt.dto.InscriptionResponseDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Inscription;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.mapper.InscriptionMapper;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InscriptionServiceTest {

    @Mock InscriptionRepository inscriptionRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock EvenementRepository evenementRepository;
    @Mock InscriptionMapper inscriptionMapper;

    @InjectMocks InscriptionService inscriptionService;

    private Utilisateur etudiant;
    private Evenement evenement;
    private Inscription inscription;
    private InscriptionResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        etudiant = Utilisateur.builder().id(10L).nom("Alaoui").email("etu@unievt.ma").build();
        evenement = Evenement.builder().id(20L).titre("Conf IA").build();

        inscription = Inscription.builder()
                .id(1L).etudiant(etudiant).evenement(evenement)
                .statut(StatutInscriptionEnum.LISTE_ATTENTE)
                .dateInscription(LocalDateTime.now()).build();

        responseDTO = new InscriptionResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setStatut(StatutInscriptionEnum.LISTE_ATTENTE);
    }

    @Test
    void creerInscription_defaultsStatutToListeAttente() {
        InscriptionCreateDTO dto = InscriptionCreateDTO.builder()
                .etudiantId(10L).evenementId(20L).build();

        when(inscriptionMapper.toEntity(dto)).thenReturn(inscription);
        inscription.setStatut(null);

        when(utilisateurRepository.findById(10L)).thenReturn(Optional.of(etudiant));
        when(evenementRepository.findById(20L)).thenReturn(Optional.of(evenement));
        when(inscriptionRepository.save(any())).thenReturn(inscription);
        when(inscriptionMapper.toResponseDTO(inscription)).thenReturn(responseDTO);

        inscriptionService.creerInscription(dto);

        assertThat(inscription.getStatut()).isEqualTo(StatutInscriptionEnum.LISTE_ATTENTE);
    }

    @Test
    void creerInscription_throwsBadRequest_whenEtudiantIdNull() {
        InscriptionCreateDTO dto = InscriptionCreateDTO.builder().evenementId(20L).build();

        assertThatThrownBy(() -> inscriptionService.creerInscription(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("etudiantId");
    }

    @Test
    void creerInscription_throwsBadRequest_whenEvenementIdNull() {
        InscriptionCreateDTO dto = InscriptionCreateDTO.builder().etudiantId(10L).build();

        assertThatThrownBy(() -> inscriptionService.creerInscription(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("evenementId");
    }

    @Test
    void creerInscription_throwsNotFound_whenEtudiantMissing() {
        InscriptionCreateDTO dto = InscriptionCreateDTO.builder()
                .etudiantId(10L).evenementId(20L).build();

        when(inscriptionMapper.toEntity(dto)).thenReturn(inscription);
        when(utilisateurRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inscriptionService.creerInscription(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Étudiant introuvable");
    }

    @Test
    void confirmer_transitionsListeAttenteToConfirmee() {
        when(inscriptionRepository.findById(1L)).thenReturn(Optional.of(inscription));
        when(inscriptionRepository.save(inscription)).thenReturn(inscription);
        responseDTO.setStatut(StatutInscriptionEnum.CONFIRMEE);
        when(inscriptionMapper.toResponseDTO(inscription)).thenReturn(responseDTO);

        InscriptionResponseDTO result = inscriptionService.confirmer(1L);
        assertThat(inscription.getStatut()).isEqualTo(StatutInscriptionEnum.CONFIRMEE);
    }

    @Test
    void confirmer_throwsBadRequest_whenAlreadyConfirmed() {
        inscription.setStatut(StatutInscriptionEnum.CONFIRMEE);
        when(inscriptionRepository.findById(1L)).thenReturn(Optional.of(inscription));

        assertThatThrownBy(() -> inscriptionService.confirmer(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("LISTE_ATTENTE");
    }

    @Test
    void annuler_setsStatutAnnulee() {
        when(inscriptionRepository.findById(1L)).thenReturn(Optional.of(inscription));
        when(inscriptionRepository.save(inscription)).thenReturn(inscription);
        when(inscriptionMapper.toResponseDTO(inscription)).thenReturn(responseDTO);

        inscriptionService.annuler(1L);
        assertThat(inscription.getStatut()).isEqualTo(StatutInscriptionEnum.ANNULEE);
    }

    @Test
    void genererQRCode_setsAndReturnsQRCode() {
        when(inscriptionRepository.findById(1L)).thenReturn(Optional.of(inscription));
        when(inscriptionRepository.save(inscription)).thenReturn(inscription);

        String qr = inscriptionService.genererQRCode(1L);

        assertThat(qr).isNotBlank();
        assertThat(inscription.getQrCode()).isEqualTo(qr);
    }

    @Test
    void supprimerInscription_throwsNotFound_whenMissing() {
        when(inscriptionRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> inscriptionService.supprimerInscription(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }
}
