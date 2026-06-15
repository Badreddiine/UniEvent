package com.unievt.scheduler;

import com.unievt.entity.Evenement;
import com.unievt.entity.Inscription;
import com.unievt.enums.NotificationTypeEnum;
import com.unievt.enums.StatutEvenementEnum;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventReminderScheduler {

    private final EvenementRepository evenementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NotificationService notificationService;

    /**
     * Runs every hour. Finds events starting in 23–25 hours and sends a
     * 24-hour reminder to every confirmed attendee.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendUpcomingEventReminders() {
        LocalDateTime now   = LocalDateTime.now();
        LocalDateTime from  = now.plusHours(23);
        LocalDateTime until = now.plusHours(25);

        List<Evenement> upcoming = evenementRepository.findAll().stream()
                .filter(e -> e.getStatut() == StatutEvenementEnum.APPROUVE)
                .filter(e -> e.getDateDebut() != null
                        && e.getDateDebut().isAfter(from)
                        && e.getDateDebut().isBefore(until))
                .toList();

        for (Evenement event : upcoming) {
            List<Inscription> attendees = inscriptionRepository
                    .findByEvenementIdAndStatut(event.getId(), StatutInscriptionEnum.CONFIRMEE);

            for (Inscription ins : attendees) {
                if (ins.getEtudiant() == null) continue;
                try {
                    notificationService.send(
                            ins.getEtudiant().getId(),
                            NotificationTypeEnum.EVENT_REMINDER,
                            Map.of(
                                "eventName",  event.getTitre(),
                                "evenementId", event.getId(),
                                "eventDate",  event.getDateDebut().toString()
                            )
                    );
                } catch (Exception ex) {
                    log.warn("Reminder failed for user {} / event {}: {}",
                            ins.getEtudiant().getId(), event.getId(), ex.getMessage());
                }
            }

            if (!attendees.isEmpty()) {
                log.info("Sent 24h reminder for event '{}' to {} attendees",
                        event.getTitre(), attendees.size());
            }
        }
    }
}
