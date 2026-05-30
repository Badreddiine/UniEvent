package com.unievt.service;

import com.unievt.dto.SalleDTO;
import com.unievt.dto.SalleResponseDTO;
import com.unievt.entity.Salle;
import com.unievt.enums.StatutSalleEnum;
import com.unievt.mapper.SalleMapper;
import com.unievt.repository.SalleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalleService {

    private final SalleRepository salleRepository;
    private final SalleMapper salleMapper;

    // ── Créer une salle ──────────────────────────────────────────────
    public SalleResponseDTO creer(SalleDTO dto) {
        Salle salle = salleMapper.toEntity(dto);
        return salleMapper.toResponseDTO(salleRepository.save(salle));
    }

    // ── Lister toutes les salles ─────────────────────────────────────
    public List<SalleResponseDTO> listerTout() {
        return salleRepository.findAll()
                .stream()
                .map(salleMapper::toResponseDTO)
                .toList();
    }

    // ── Lire une salle par ID ────────────────────────────────────────
    public SalleResponseDTO lireParId(Long id) {
        return salleMapper.toResponseDTO(trouverOuEchouer(id));
    }

    // ── Lister par statut ────────────────────────────────────────────
    public List<SalleResponseDTO> listerParStatut(StatutSalleEnum statut) {
        return salleRepository.findByStatut(statut)
                .stream()
                .map(salleMapper::toResponseDTO)
                .toList();
    }

    // ── Modifier une salle ───────────────────────────────────────────
    public SalleResponseDTO modifier(Long id, SalleDTO dto) {
        Salle salle = trouverOuEchouer(id);
        salleMapper.updateEntityFromDTO(dto, salle);
        return salleMapper.toResponseDTO(salleRepository.save(salle));
    }

    // ── Changer le statut ────────────────────────────────────────────
    public SalleResponseDTO changerStatut(Long id, StatutSalleEnum statut) {
        Salle salle = trouverOuEchouer(id);
        salle.setStatut(statut);
        return salleMapper.toResponseDTO(salleRepository.save(salle));
    }

    // ── Supprimer une salle ──────────────────────────────────────────
    public void supprimer(Long id) {
        trouverOuEchouer(id);
        salleRepository.deleteById(id);
    }

    // ── Utilitaire privé ─────────────────────────────────────────────
    private Salle trouverOuEchouer(Long id) {
        return salleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable : " + id));
    }
}
