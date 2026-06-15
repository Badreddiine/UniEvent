package com.unievt.service;

import com.unievt.dto.analytics.DailyCountDto;
import com.unievt.dto.analytics.EventAnalyticsDto;
import com.unievt.dto.analytics.OverviewDto;
import com.unievt.dto.analytics.RoomUtilizationDto;
import com.unievt.entity.Evenement;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.repository.ReservationRepository;
import com.unievt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final EvenementRepository evenementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final ReservationRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;

    // ── Overview ──────────────────────────────────────────────────────────────

    @Cacheable("analytics-overview")
    public OverviewDto getOverview() {
        long totalEvents        = evenementRepository.count();
        long totalUsers         = utilisateurRepository.count();
        long totalRegistrations = inscriptionRepository.countActive();

        // Occupancy = sum(confirmed per event) / sum(capacite per event that has one)
        double occupancyRate = computeGlobalOccupancy();

        return OverviewDto.builder()
                .totalEvents(totalEvents)
                .totalUsers(totalUsers)
                .totalRegistrations(totalRegistrations)
                .occupancyRate(occupancyRate)
                .build();
    }

    // ── Per-event stats ───────────────────────────────────────────────────────

    @Cacheable(value = "analytics-event", key = "#eventId")
    public EventAnalyticsDto getEventStats(Long eventId) {
        Evenement event = evenementRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + eventId));

        long confirmed  = inscriptionRepository.countByEvenementIdAndStatut(
                eventId, StatutInscriptionEnum.CONFIRMEE);
        long waitlisted = inscriptionRepository.countByEvenementIdAndStatut(
                eventId, StatutInscriptionEnum.LISTE_ATTENTE);
        long cancelled  = inscriptionRepository.countByEvenementIdAndStatut(
                eventId, StatutInscriptionEnum.ANNULEE);

        Double attendanceRate = null;
        if (event.getCapacite() != null && event.getCapacite() > 0) {
            attendanceRate = (confirmed * 100.0) / event.getCapacite();
        }

        List<DailyCountDto> overTime = inscriptionRepository.countByDayForEvent(eventId)
                .stream()
                .map(this::toDailyCount)
                .toList();

        List<RoomUtilizationDto> roomUtil = reservationRepository.approvedHoursByRoom(eventId)
                .stream()
                .map(row -> RoomUtilizationDto.builder()
                        .roomId(toLong(row[0]))
                        .roomName(String.valueOf(row[1]))
                        .approvedHours(toDouble(row[2]))
                        .build())
                .toList();

        return EventAnalyticsDto.builder()
                .eventId(eventId)
                .eventTitle(event.getTitre())
                .capacite(event.getCapacite())
                .confirmedRegistrations(confirmed)
                .waitlistSize(waitlisted)
                .cancelledRegistrations(cancelled)
                .attendanceRate(attendanceRate)
                .registrationsOverTime(overTime)
                .roomUtilization(roomUtil)
                .build();
    }

    // ── Registration trend ────────────────────────────────────────────────────

    @Cacheable(value = "analytics-trend", key = "#from.toString() + '_' + #to.toString()")
    public List<DailyCountDto> getRegistrationTrend(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "'from' must be before or equal to 'to'");
        }
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(LocalTime.MAX);

        return inscriptionRepository.countByDay(dtFrom, dtTo)
                .stream()
                .map(this::toDailyCount)
                .toList();
    }

    // ── Room utilization ──────────────────────────────────────────────────────

    @Cacheable("analytics-rooms")
    public List<RoomUtilizationDto> getRoomsUtilization() {
        return reservationRepository.roomUtilizationStats()
                .stream()
                .map(row -> {
                    double approved  = toDouble(row[3]);
                    double requested = toDouble(row[4]);
                    double pct = requested > 0 ? (approved / requested * 100) : 0.0;
                    return RoomUtilizationDto.builder()
                            .roomId(toLong(row[0]))
                            .roomName(String.valueOf(row[1]))
                            .totalReservations(toLong(row[2]))
                            .approvedHours(approved)
                            .totalRequestedHours(requested)
                            .utilizationPercent(Math.round(pct * 10.0) / 10.0)
                            .build();
                })
                .toList();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private double computeGlobalOccupancy() {
        List<Evenement> events = evenementRepository.findAll();
        long totalCapacity  = events.stream()
                .filter(e -> e.getCapacite() != null && e.getCapacite() > 0)
                .mapToLong(Evenement::getCapacite)
                .sum();
        if (totalCapacity == 0) return 0.0;

        long totalConfirmed = events.stream()
                .filter(e -> e.getCapacite() != null && e.getCapacite() > 0)
                .mapToLong(e -> inscriptionRepository.countByEvenementIdAndStatut(
                        e.getId(), StatutInscriptionEnum.CONFIRMEE))
                .sum();

        double raw = (totalConfirmed * 100.0) / totalCapacity;
        return Math.round(raw * 10.0) / 10.0;
    }

    private DailyCountDto toDailyCount(Object[] row) {
        LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
        long count = ((Number) row[1]).longValue();
        return new DailyCountDto(date, count);
    }

    private Long toLong(Object val) {
        return val == null ? null : ((Number) val).longValue();
    }

    private double toDouble(Object val) {
        return val == null ? 0.0 : ((Number) val).doubleValue();
    }
}
