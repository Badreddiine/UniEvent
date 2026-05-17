package com.unievt.service;

import com.unievt.dto.EvaluationDTO;
import com.unievt.dto.EvaluationResponseDTO;
import com.unievt.entity.Evaluation;
import com.unievt.entity.Utilisateur;
import com.unievt.mapper.EvaluationMapper;
import com.unievt.repository.EvaluationRepository;
import com.unievt.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EvaluationMapper evaluationMapper;

    // ── Créer une évaluation ─────────────────────────────────────────
    public EvaluationResponseDTO creer(EvaluationDTO dto) {
        if (dto.getNote() < 1 || dto.getNote() > 5) {
            throw new IllegalArgumentException("La note doit être entre 1 et 5");
        }

        Utilisateur etudiant = utilisateurRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + dto.getEtudiantId()));

        Evaluation evaluation = evaluationMapper.toEntity(dto);
        evaluation.setEtudiant(etudiant);

        return evaluationMapper.toResponseDTO(evaluationRepository.save(evaluation));
    }

    // ── Lister toutes les évaluations ───────────────────────────────
    public List<EvaluationResponseDTO> listerTout() {
        return evaluationRepository.findAll()
                .stream()
                .map(evaluationMapper::toResponseDTO)
                .toList();
    }

    // ── Lire une évaluation par ID ───────────────────────────────────
    public EvaluationResponseDTO lireParId(Long id) {
        return evaluationMapper.toResponseDTO(trouverOuEchouer(id));
    }

    // ── Lister les évaluations d'un étudiant ─────────────────────────
    public List<EvaluationResponseDTO> listerParEtudiant(Long etudiantId) {
        return evaluationRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(evaluationMapper::toResponseDTO)
                .toList();
    }

    // ── Modifier une évaluation ──────────────────────────────────────
    public EvaluationResponseDTO modifier(Long id, EvaluationDTO dto) {
        if (dto.getNote() != null && (dto.getNote() < 1 || dto.getNote() > 5)) {
            throw new IllegalArgumentException("La note doit être entre 1 et 5");
        }
        Evaluation evaluation = trouverOuEchouer(id);
        evaluationMapper.updateEntityFromDTO(dto, evaluation);
        return evaluationMapper.toResponseDTO(evaluationRepository.save(evaluation));
    }

    // ── Supprimer une évaluation ─────────────────────────────────────
    public void supprimer(Long id) {
        trouverOuEchouer(id);
        evaluationRepository.deleteById(id);
    }

    // ── Utilitaire privé ─────────────────────────────────────────────
    private Evaluation trouverOuEchouer(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Évaluation introuvable : " + id));
    }
}
