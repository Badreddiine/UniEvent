package com.unievt.service;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.NotificationResponseDTO;
import com.unievt.entity.Notification;
import com.unievt.entity.Utilisateur;
import com.unievt.enums.TypeNotifEnum;
import com.unievt.mapper.NotificationMapper;
import com.unievt.repository.NotificationRepository;
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
class NotificationServiceTest {

    @Mock NotificationRepository notificationRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock NotificationMapper notificationMapper;

    @InjectMocks NotificationService notificationService;

    private Utilisateur destinataire;
    private Notification notification;
    private NotificationResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        destinataire = Utilisateur.builder().id(5L).nom("Alaoui").prenom("Fatima").build();

        notification = Notification.builder()
                .id(1L).titre("Rappel").message("Événement dans 24h")
                .type(TypeNotifEnum.EMAIL).destinataire(destinataire).lu(false).build();

        responseDTO = NotificationResponseDTO.builder()
                .id(1L).titre("Rappel").lu(false).destinataireId(5L).build();
    }

    @Test
    void creer_setsLuFalseAndSaves() {
        NotificationDTO dto = NotificationDTO.builder()
                .titre("Rappel").message("Événement dans 24h")
                .type(TypeNotifEnum.EMAIL).destinataireId(5L).build();

        when(utilisateurRepository.findById(5L)).thenReturn(Optional.of(destinataire));
        when(notificationMapper.toEntity(dto)).thenReturn(notification);
        notification.setLu(null);
        when(notificationRepository.save(any())).thenReturn(notification);
        when(notificationMapper.toResponseDTO(notification)).thenReturn(responseDTO);

        notificationService.creer(dto);

        assertThat(notification.getLu()).isFalse();
    }

    @Test
    void creer_throwsEntityNotFound_whenDestinataireMissing() {
        NotificationDTO dto = NotificationDTO.builder().destinataireId(99L).build();
        when(utilisateurRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.creer(dto))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void marquerLue_setsLuTrue() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);
        responseDTO.setLu(true);
        when(notificationMapper.toResponseDTO(notification)).thenReturn(responseDTO);

        NotificationResponseDTO result = notificationService.marquerLue(1L);
        assertThat(notification.getLu()).isTrue();
    }

    @Test
    void marquerLue_throwsEntityNotFound_whenMissing() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.marquerLue(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void marquerToutesLues_updatesAllUnread() {
        Notification n2 = Notification.builder().id(2L).lu(false).destinataire(destinataire).build();
        when(notificationRepository.findByDestinataireIdAndLuFalse(5L))
                .thenReturn(List.of(notification, n2));
        when(notificationRepository.saveAll(anyList())).thenReturn(List.of());

        notificationService.marquerToutesLues(5L);

        assertThat(notification.getLu()).isTrue();
        assertThat(n2.getLu()).isTrue();
        verify(notificationRepository).saveAll(anyList());
    }

    @Test
    void listerNonLues_returnsOnlyUnread() {
        when(notificationRepository.findByDestinataireIdAndLuFalse(5L))
                .thenReturn(List.of(notification));
        when(notificationMapper.toResponseDTO(notification)).thenReturn(responseDTO);

        List<NotificationResponseDTO> result = notificationService.listerNonLues(5L);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLu()).isFalse();
    }

    @Test
    void supprimer_deletesWhenFound() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.supprimer(1L);

        verify(notificationRepository).deleteById(1L);
    }

    @Test
    void supprimer_throwsEntityNotFound_whenMissing() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.supprimer(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
