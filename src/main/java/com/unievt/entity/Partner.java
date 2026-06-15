package com.unievt.entity;

import com.unievt.enums.TypePartenaireEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "partenaire")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "site_web")
    private String siteWeb;

    @Column(name = "email_contact")
    private String emailContact;

    @Column(name = "nom_contact")
    private String nomContact;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TypePartenaireEnum type;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private boolean actif = true;
}
