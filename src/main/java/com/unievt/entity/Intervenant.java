package com.unievt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "intervenant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Intervenant extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_intervenant")
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String institution;

    @Column(columnDefinition = "TEXT")
    private String biographie;
}