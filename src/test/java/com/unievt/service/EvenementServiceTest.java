package com.unievt.service;

import com.unievt.dto.EvenementCreateDTO;
import com.unievt.dto.EvenementResponseDTO;
import com.unievt.entity.Evenement;
import com.unievt.enums.CategorieEnum;
import com.unievt.enums.StatutEvenementEnum;
import com.unievt.enums.TypeEvenementEnum;
import com.unievt.enums.VisibiliteEnum;
import com.unievt.mapper.EvenementMapper;
import com.unievt.repository.ClubRepository;
import com.unievt.repository.EvenementRepository;
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
class EvenementServiceTest {

    @Mock EvenementRepository evenementRepository;
    @Mock ClubRepository clubRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock EvenementMapper evenementMapper;

    @InjectMocks EvenementService evenementService;

    private Evenement evenement;
    private EvenementResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        evenement = Evenement.builder()
                .id(1L).titre("Conférence IA")
                .categorie(CategorieEnum.CONFERENCE)
                .dateDebut(LocalDateTime.now().plusDays(7))
                .dateFin(LocalDateTime.now().plusDays(7).plusHours(3))
                .capacite(100)
                .statut(StatutEvenementEnum.BROUILLON)
                .visibilite(VisibiliteEnum.UNIVERSITE)
                .type(TypeEvenementEnum.CLUB)
                .build();

        responseDTO = new EvenementResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setTitre("Conférence IA");
        responseDTO.setStatut(StatutEvenementEnum.BROUILLON);
    }

    @Test
    void creerEvenement_defaultsStatutToBrouillon() {
        EvenementCreateDTO dto = new EvenementCreateDTO();
        dto.setTitre("Conférence IA");
        dto.setDateDebut(LocalDateTime.now().plusDays(1));
        dto.setDateFin(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setCapacite(50);

        when(evenementMapper.toEntity(dto)).thenReturn(evenement);
        when(evenementRepository.save(any())).thenReturn(evenement);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        EvenementResponseDTO result = evenementService.creerEvenement(dto);
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.BROUILLON);
    }

    @Test
    void creerEvenement_throwsBadRequest_whenDateFinBeforeDateDebut() {
        EvenementCreateDTO dto = new EvenementCreateDTO();
        dto.setDateDebut(LocalDateTime.now().plusDays(5));
        dto.setDateFin(LocalDateTime.now().plusDays(1));

        assertThatThrownBy(() -> evenementService.creerEvenement(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("date de fin");
    }

    @Test
    void creerEvenement_throwsBadRequest_whenCapaciteNegative() {
        EvenementCreateDTO dto = new EvenementCreateDTO();
        dto.setCapacite(-5);

        assertThatThrownBy(() -> evenementService.creerEvenement(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("capacité");
    }

    @Test
    void soumettre_transitionsBrouillonToSoumis() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));
        when(evenementRepository.save(evenement)).thenReturn(evenement);
        responseDTO.setStatut(StatutEvenementEnum.SOUMIS);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        EvenementResponseDTO result = evenementService.soumettre(1L);
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.SOUMIS);
    }

    @Test
    void soumettre_throwsBadRequest_whenNotBrouillon() {
        evenement.setStatut(StatutEvenementEnum.SOUMIS);
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));

        assertThatThrownBy(() -> evenementService.soumettre(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("BROUILLON");
    }

    @Test
    void verifier_transitionsSoumisToVerifie() {
        evenement.setStatut(StatutEvenementEnum.SOUMIS);
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));
        when(evenementRepository.save(evenement)).thenReturn(evenement);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        evenementService.verifier(1L);
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.VERIFIE);
    }

    @Test
    void approuver_transitionsVerifieToApprouve() {
        evenement.setStatut(StatutEvenementEnum.VERIFIE);
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));
        when(evenementRepository.save(evenement)).thenReturn(evenement);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        evenementService.approuver(1L);
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.APPROUVE);
    }

    @Test
    void rejeter_requiresMotif() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));

        assertThatThrownBy(() -> evenementService.rejeter(1L, ""))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("motif");
    }

    @Test
    void rejeter_setsStatutRejete() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));
        when(evenementRepository.save(evenement)).thenReturn(evenement);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        evenementService.rejeter(1L, "Budget insuffisant");
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.REJETE);
    }

    @Test
    void annuler_setsStatutAnnule() {
        evenement.setStatut(StatutEvenementEnum.APPROUVE);
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(evenement));
        when(evenementRepository.save(evenement)).thenReturn(evenement);
        when(evenementMapper.toResponseDTO(evenement)).thenReturn(responseDTO);

        evenementService.annuler(1L);
        assertThat(evenement.getStatut()).isEqualTo(StatutEvenementEnum.ANNULE);
    }

    @Test
    void lireEvenement_throwsNotFound_whenMissing() {
        when(evenementRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> evenementService.lireEvenement(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void supprimerEvenement_throwsNotFound_whenMissing() {
        when(evenementRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> evenementService.supprimerEvenement(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }
}
