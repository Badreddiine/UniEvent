package com.unievt.event;

import com.unievt.dto.NotificationDTO;
import com.unievt.entity.Inscription;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.enums.TypeNotifEnum;
import com.unievt.repository.InscriptionRepository;
import com.unievt.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class WaitlistPromotionListener {

    private final InscriptionRepository inscriptionRepository;
    private final NotificationService notificationService;

    @EventListener
    @Transactional
    public void onWaitlistPromotion(WaitlistPromotionEvent event) {
        Long evenementId = event.getEvenementId();

        inscriptionRepository
                .findFirstByEvenementIdAndStatutOrderByDateInscriptionAsc(
                        evenementId, StatutInscriptionEnum.LISTE_ATTENTE)
                .ifPresent(inscription -> {
                    inscription.setStatut(StatutInscriptionEnum.CONFIRMEE);
                    inscription.setQrCode(UUID.randomUUID().toString());
                    inscriptionRepository.save(inscription);

                    String titre = inscription.getEvenement() != null
                            ? inscription.getEvenement().getTitre() : "l'événement";

                    if (inscription.getEtudiant() != null) {
                        notificationService.creer(NotificationDTO.builder()
                                .titre("Place disponible — inscription confirmée")
                                .message("Une place s'est libérée pour \"" + titre
                                        + "\". Votre inscription est maintenant confirmée.")
                                .type(TypeNotifEnum.PUSH)
                                .destinataireId(inscription.getEtudiant().getId())
                                .evenementId(evenementId)
                                .build());
                    }
                });
    }
}
