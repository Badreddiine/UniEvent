package com.unievt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "etudiant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "id_utilisateur")
public class Etudiant extends Utilisateur {

    private String filiere;

    @Column(name = "annee_etude")
    private Integer anneeEtude;

    private String cin;
}