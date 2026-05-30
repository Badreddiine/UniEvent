package com.unievt.controller;

import com.unievt.dto.ReservationDTO;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // POST /reservations — créer une réservation
    @PostMapping
    public ResponseEntity<ReservationResponseDTO> creer(@RequestBody ReservationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.creer(dto));
    }

    // GET /reservations — lister toutes
    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> listerTout() {
        return ResponseEntity.ok(reservationService.listerTout());
    }

    // GET /reservations/{id} — lire une réservation
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> lireParId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.lireParId(id));
    }

    // GET /reservations/demandeur/{demandeurId} — réservations d'un utilisateur
    @GetMapping("/demandeur/{demandeurId}")
    public ResponseEntity<List<ReservationResponseDTO>> listerParDemandeur(
            @PathVariable Long demandeurId) {
        return ResponseEntity.ok(reservationService.listerParDemandeur(demandeurId));
    }

    // GET /reservations/salle/{salleId} — réservations d'une salle
    @GetMapping("/salle/{salleId}")
    public ResponseEntity<List<ReservationResponseDTO>> listerParSalle(
            @PathVariable Long salleId) {
        return ResponseEntity.ok(reservationService.listerParSalle(salleId));
    }

    // PATCH /reservations/{id}/approuver — approuver (idempotent)
    @PatchMapping("/{id}/approuver")
    public ResponseEntity<ReservationResponseDTO> approuver(
            @PathVariable Long id,
            @RequestParam Long approbateurId) {
        return ResponseEntity.ok(reservationService.approuver(id, approbateurId));
    }

    // PATCH /reservations/{id}/rejeter — rejeter
    @PatchMapping("/{id}/rejeter")
    public ResponseEntity<ReservationResponseDTO> rejeter(
            @PathVariable Long id,
            @RequestParam Long approbateurId) {
        return ResponseEntity.ok(reservationService.rejeter(id, approbateurId));
    }

    // PATCH /reservations/{id}/annuler — annuler (idempotent)
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<ReservationResponseDTO> annuler(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.annuler(id));
    }

    // DELETE /reservations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        reservationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
