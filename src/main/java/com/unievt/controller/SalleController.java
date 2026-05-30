package com.unievt.controller;

import com.unievt.dto.SalleDTO;
import com.unievt.dto.SalleResponseDTO;
import com.unievt.enums.StatutSalleEnum;
import com.unievt.service.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salles")
@RequiredArgsConstructor
public class SalleController {

    private final SalleService salleService;

    // POST /salles — créer une salle
    @PostMapping
    public ResponseEntity<SalleResponseDTO> creer(@RequestBody SalleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(salleService.creer(dto));
    }

    // GET /salles — lister toutes les salles
    @GetMapping
    public ResponseEntity<List<SalleResponseDTO>> listerTout() {
        return ResponseEntity.ok(salleService.listerTout());
    }

    // GET /salles/{id} — lire une salle
    @GetMapping("/{id}")
    public ResponseEntity<SalleResponseDTO> lireParId(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.lireParId(id));
    }

    // GET /salles/statut/{statut} — filtrer par statut (DISPONIBLE, MAINTENANCE, HORS_SERVICE)
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<SalleResponseDTO>> listerParStatut(
            @PathVariable StatutSalleEnum statut) {
        return ResponseEntity.ok(salleService.listerParStatut(statut));
    }

    // PUT /salles/{id} — modifier une salle
    @PutMapping("/{id}")
    public ResponseEntity<SalleResponseDTO> modifier(
            @PathVariable Long id,
            @RequestBody SalleDTO dto) {
        return ResponseEntity.ok(salleService.modifier(id, dto));
    }

    // PATCH /salles/{id}/statut — changer uniquement le statut
    @PatchMapping("/{id}/statut")
    public ResponseEntity<SalleResponseDTO> changerStatut(
            @PathVariable Long id,
            @RequestParam StatutSalleEnum statut) {
        return ResponseEntity.ok(salleService.changerStatut(id, statut));
    }

    // DELETE /salles/{id} — supprimer une salle
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        salleService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
