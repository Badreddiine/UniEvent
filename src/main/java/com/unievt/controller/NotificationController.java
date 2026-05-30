package com.unievt.controller;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.NotificationResponseDTO;
import com.unievt.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // POST /notifications — créer une notification
    @PostMapping
    public ResponseEntity<NotificationResponseDTO> creer(@RequestBody NotificationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.creer(dto));
    }

    // GET /notifications/{id} — lire une notification
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> lireParId(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.lireParId(id));
    }

    // GET /notifications/utilisateur/{destinataireId} — toutes les notifs d'un user
    @GetMapping("/utilisateur/{destinataireId}")
    public ResponseEntity<List<NotificationResponseDTO>> listerParDestinataire(
            @PathVariable Long destinataireId) {
        return ResponseEntity.ok(notificationService.listerParDestinataire(destinataireId));
    }

    // GET /notifications/utilisateur/{destinataireId}/non-lues — notifs non lues
    @GetMapping("/utilisateur/{destinataireId}/non-lues")
    public ResponseEntity<List<NotificationResponseDTO>> listerNonLues(
            @PathVariable Long destinataireId) {
        return ResponseEntity.ok(notificationService.listerNonLues(destinataireId));
    }

    // PATCH /notifications/{id}/lire — marquer une notif comme lue (idempotent)
    @PatchMapping("/{id}/lire")
    public ResponseEntity<NotificationResponseDTO> marquerLue(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.marquerLue(id));
    }

    // PATCH /notifications/utilisateur/{destinataireId}/lire-tout — tout marquer lu
    @PatchMapping("/utilisateur/{destinataireId}/lire-tout")
    public ResponseEntity<Void> marquerToutesLues(@PathVariable Long destinataireId) {
        notificationService.marquerToutesLues(destinataireId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        notificationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
