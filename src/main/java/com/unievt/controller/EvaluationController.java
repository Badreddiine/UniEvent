package com.unievt.controller;

import com.unievt.dto.EvaluationDTO;
import com.unievt.dto.EvaluationResponseDTO;
import com.unievt.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    // POST /evaluations — créer une évaluation
    @PostMapping
    public ResponseEntity<EvaluationResponseDTO> creer(@RequestBody EvaluationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(evaluationService.creer(dto));
    }

    // GET /evaluations — lister toutes
    @GetMapping
    public ResponseEntity<List<EvaluationResponseDTO>> listerTout() {
        return ResponseEntity.ok(evaluationService.listerTout());
    }

    // GET /evaluations/{id} — lire une évaluation
    @GetMapping("/{id}")
    public ResponseEntity<EvaluationResponseDTO> lireParId(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.lireParId(id));
    }

    // GET /evaluations/etudiant/{etudiantId} — évaluations d'un étudiant
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<EvaluationResponseDTO>> listerParEtudiant(
            @PathVariable Long etudiantId) {
        return ResponseEntity.ok(evaluationService.listerParEtudiant(etudiantId));
    }

    // PUT /evaluations/{id} — modifier une évaluation
    @PutMapping("/{id}")
    public ResponseEntity<EvaluationResponseDTO> modifier(
            @PathVariable Long id,
            @RequestBody EvaluationDTO dto) {
        return ResponseEntity.ok(evaluationService.modifier(id, dto));
    }

    // DELETE /evaluations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        evaluationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
