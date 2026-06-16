package com.unievt.mapper;

import com.unievt.dto.EtudiantCreateDTO;
import com.unievt.dto.EtudiantResponseDTO;
import com.unievt.dto.EtudiantUpdateDTO;
import com.unievt.entity.Etudiant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:24:14+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class EtudiantMapperImpl implements EtudiantMapper {

    @Override
    public Etudiant toEntity(EtudiantCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Etudiant.EtudiantBuilder<?, ?> etudiant = Etudiant.builder();

        etudiant.nom( dto.getNom() );
        etudiant.prenom( dto.getPrenom() );
        etudiant.email( dto.getEmail() );
        etudiant.motDePasse( dto.getMotDePasse() );
        etudiant.photo( dto.getPhoto() );
        etudiant.telephone( dto.getTelephone() );
        etudiant.filiere( dto.getFiliere() );
        etudiant.anneeEtude( dto.getAnneeEtude() );
        etudiant.cin( dto.getCin() );

        return etudiant.build();
    }

    @Override
    public EtudiantResponseDTO toResponseDTO(Etudiant entity) {
        if ( entity == null ) {
            return null;
        }

        EtudiantResponseDTO.EtudiantResponseDTOBuilder etudiantResponseDTO = EtudiantResponseDTO.builder();

        etudiantResponseDTO.id( entity.getId() );
        etudiantResponseDTO.nom( entity.getNom() );
        etudiantResponseDTO.prenom( entity.getPrenom() );
        etudiantResponseDTO.email( entity.getEmail() );
        etudiantResponseDTO.photo( entity.getPhoto() );
        etudiantResponseDTO.telephone( entity.getTelephone() );
        etudiantResponseDTO.role( entity.getRole() );
        etudiantResponseDTO.actif( entity.getActif() );
        etudiantResponseDTO.dateCreation( entity.getDateCreation() );
        etudiantResponseDTO.filiere( entity.getFiliere() );
        etudiantResponseDTO.anneeEtude( entity.getAnneeEtude() );
        etudiantResponseDTO.cin( entity.getCin() );

        return etudiantResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(EtudiantUpdateDTO dto, Etudiant entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getNom() != null ) {
            entity.setNom( dto.getNom() );
        }
        if ( dto.getPrenom() != null ) {
            entity.setPrenom( dto.getPrenom() );
        }
        if ( dto.getPhoto() != null ) {
            entity.setPhoto( dto.getPhoto() );
        }
        if ( dto.getTelephone() != null ) {
            entity.setTelephone( dto.getTelephone() );
        }
        if ( dto.getFiliere() != null ) {
            entity.setFiliere( dto.getFiliere() );
        }
        if ( dto.getAnneeEtude() != null ) {
            entity.setAnneeEtude( dto.getAnneeEtude() );
        }
    }
}
