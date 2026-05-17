package com.unievt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unievt.entity.Evenement;
import com.unievt.enums.CategorieEnum;
import com.unievt.enums.StatutEvenementEnum;

public interface EvenementRepository extends JpaRepository<Evenement, Long> {
    List<Evenement> findByStatut(StatutEvenementEnum statut);
    List<Evenement> findByClubId(Long clubId);
    List<Evenement> findByOrganisateurId(Long organisateurId);
    List<Evenement> findByCategorie(CategorieEnum categorie);
}
