package com.unievt.service;

import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.dto.UtilisateurResponseDTO;
import com.unievt.dto.UtilisateurUpdateDTO;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.RoleEnum;
import com.unievt.mapper.UtilisateurMapper;
import com.unievt.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock UtilisateurRepository utilisateurRepository;
    @Mock UtilisateurMapper utilisateurMapper;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UtilisateurService utilisateurService;

    private Utilisateur utilisateur;
    private UtilisateurResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        utilisateur = Utilisateur.builder()
                .id(1L).nom("Alami").prenom("Hassan")
                .email("hassan@unievt.ma").motDePasse("hashed")
                .role(RoleEnum.DOYEN).actif(true).build();

        responseDTO = UtilisateurResponseDTO.builder()
                .id(1L).nom("Alami").prenom("Hassan")
                .email("hassan@unievt.ma").role(RoleEnum.DOYEN).actif(true).build();
    }

    @Test
    void creer_savesAndReturnsMappedDTO() {
        UtilisateurCreateDTO dto = UtilisateurCreateDTO.builder()
                .nom("Alami").prenom("Hassan").email("hassan@unievt.ma")
                .motDePasse("plaintext").role(RoleEnum.DOYEN).build();

        when(utilisateurRepository.existsByEmail("hassan@unievt.ma")).thenReturn(false);
        when(utilisateurMapper.toEntity(dto)).thenReturn(utilisateur);
        when(passwordEncoder.encode("plaintext")).thenReturn("$2a$10$mockedHashValue");
        when(utilisateurRepository.save(any())).thenReturn(utilisateur);
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(responseDTO);

        UtilisateurResponseDTO result = utilisateurService.creer(dto);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("hassan@unievt.ma");
        verify(utilisateurRepository).save(argThat(u -> u.getMotDePasse().startsWith("$2")));
    }

    @Test
    void creer_throwsConflict_whenEmailAlreadyExists() {
        UtilisateurCreateDTO dto = UtilisateurCreateDTO.builder()
                .nom("X").prenom("X").email("dup@unievt.ma").motDePasse("p").build();

        when(utilisateurRepository.existsByEmail("dup@unievt.ma")).thenReturn(true);

        assertThatThrownBy(() -> utilisateurService.creer(dto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("existe déjà");
    }

    @Test
    void lister_returnsAllMapped() {
        when(utilisateurRepository.findAll()).thenReturn(List.of(utilisateur));
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(responseDTO);

        assertThat(utilisateurService.lister()).hasSize(1);
    }

    @Test
    void lire_throwsNotFound_whenMissing() {
        when(utilisateurRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> utilisateurService.lire(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void activer_setsActifTrue() {
        utilisateur.setActif(false);
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(utilisateurRepository.save(utilisateur)).thenReturn(utilisateur);
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(
                UtilisateurResponseDTO.builder().actif(true).build());

        UtilisateurResponseDTO result = utilisateurService.activer(1L);
        assertThat(result.getActif()).isTrue();
    }

    @Test
    void desactiver_setsActifFalse() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(utilisateurRepository.save(utilisateur)).thenReturn(utilisateur);
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(
                UtilisateurResponseDTO.builder().actif(false).build());

        UtilisateurResponseDTO result = utilisateurService.desactiver(1L);
        assertThat(result.getActif()).isFalse();
    }

    @Test
    void changerEmail_throwsConflict_whenTakenByOther() {
        Utilisateur other = Utilisateur.builder().id(1L).email("old@unievt.ma").build();
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(other));
        when(utilisateurRepository.existsByEmail("taken@unievt.ma")).thenReturn(true);

        assertThatThrownBy(() -> utilisateurService.changerEmail(1L, "taken@unievt.ma"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("déjà utilisé");
    }

    @Test
    void changerEmail_isIdempotent_whenSameEmail() {
        utilisateur.setEmail("hassan@unievt.ma");
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(utilisateurRepository.save(utilisateur)).thenReturn(utilisateur);
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(responseDTO);

        UtilisateurResponseDTO result = utilisateurService.changerEmail(1L, "hassan@unievt.ma");
        assertThat(result.getEmail()).isEqualTo("hassan@unievt.ma");
        verify(utilisateurRepository, never()).existsByEmail("hassan@unievt.ma");
    }

    @Test
    void changerRole_updatesRole() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(utilisateurRepository.save(utilisateur)).thenReturn(utilisateur);
        when(utilisateurMapper.toResponseDTO(utilisateur)).thenReturn(
                UtilisateurResponseDTO.builder().role(RoleEnum.ADMIN).build());

        UtilisateurResponseDTO result = utilisateurService.changerRole(1L, RoleEnum.ADMIN);
        assertThat(result.getRole()).isEqualTo(RoleEnum.ADMIN);
    }

    @Test
    void supprimer_throwsNotFound_whenMissing() {
        when(utilisateurRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> utilisateurService.supprimer(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void supprimer_deletesWhenFound() {
        when(utilisateurRepository.existsById(1L)).thenReturn(true);

        utilisateurService.supprimer(1L);

        verify(utilisateurRepository).deleteById(1L);
    }
}
