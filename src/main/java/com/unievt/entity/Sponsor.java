package com.unievt.entity;

import com.unievt.enums.NiveauSponsorEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sponsor", uniqueConstraints = @UniqueConstraint(name = "uc_sponsor_partenaire_evenement", columnNames = {"id_partenaire", "id_evenement"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sponsor extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau")
    private NiveauSponsorEnum niveau;

    @Column(name = "montant", precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(name = "confirme", nullable = false)
    @Builder.Default
    private boolean confirme = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_partenaire", nullable = false)
    private Partner partenaire;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_evenement", nullable = false)
    private Evenement evenement;
}
