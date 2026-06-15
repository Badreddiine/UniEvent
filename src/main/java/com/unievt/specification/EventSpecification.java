package com.unievt.specification;

import com.unievt.entity.Evenement;
import com.unievt.enums.CategorieEnum;
import com.unievt.enums.StatutEvenementEnum;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventSpecification implements Specification<Evenement> {

    private final CategorieEnum categorie;
    private final StatutEvenementEnum statut;
    private final LocalDateTime dateFrom;
    private final LocalDateTime dateTo;

    public EventSpecification(CategorieEnum categorie, StatutEvenementEnum statut,
                               LocalDateTime dateFrom, LocalDateTime dateTo) {
        this.categorie = categorie;
        this.statut = statut;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
    }

    @Override
    public Predicate toPredicate(Root<Evenement> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();
        if (categorie != null) {
            predicates.add(cb.equal(root.get("categorie"), categorie));
        }
        if (statut != null) {
            predicates.add(cb.equal(root.get("statut"), statut));
        }
        if (dateFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("dateDebut"), dateFrom));
        }
        if (dateTo != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("dateFin"), dateTo));
        }
        return cb.and(predicates.toArray(new Predicate[0]));
    }
}
