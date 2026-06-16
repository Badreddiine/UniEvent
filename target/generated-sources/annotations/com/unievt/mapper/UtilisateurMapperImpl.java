package com.unievt.mapper;

import com.unievt.dto.UpdateMeDTO;
import com.unievt.dto.UserDTO;
import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.dto.UtilisateurResponseDTO;
import com.unievt.dto.UtilisateurUpdateDTO;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:58:19+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class UtilisateurMapperImpl implements UtilisateurMapper {

    @Override
    public Utilisateur toEntity(UtilisateurCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Utilisateur.UtilisateurBuilder<?, ?> utilisateur = Utilisateur.builder();

        utilisateur.nom( dto.getNom() );
        utilisateur.prenom( dto.getPrenom() );
        utilisateur.email( dto.getEmail() );
        utilisateur.motDePasse( dto.getMotDePasse() );
        utilisateur.photo( dto.getPhoto() );
        utilisateur.telephone( dto.getTelephone() );
        utilisateur.role( dto.getRole() );

        return utilisateur.build();
    }

    @Override
    public UtilisateurResponseDTO toResponseDTO(Utilisateur entity) {
        if ( entity == null ) {
            return null;
        }

        UtilisateurResponseDTO.UtilisateurResponseDTOBuilder utilisateurResponseDTO = UtilisateurResponseDTO.builder();

        utilisateurResponseDTO.id( entity.getId() );
        utilisateurResponseDTO.nom( entity.getNom() );
        utilisateurResponseDTO.prenom( entity.getPrenom() );
        utilisateurResponseDTO.email( entity.getEmail() );
        utilisateurResponseDTO.photo( entity.getPhoto() );
        utilisateurResponseDTO.telephone( entity.getTelephone() );
        utilisateurResponseDTO.role( entity.getRole() );
        utilisateurResponseDTO.actif( entity.getActif() );
        utilisateurResponseDTO.dateCreation( entity.getDateCreation() );

        return utilisateurResponseDTO.build();
    }

    @Override
    public UserDTO toUserDTO(Utilisateur entity) {
        if ( entity == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder userDTO = UserDTO.builder();

        userDTO.id( entity.getId() );
        userDTO.nom( entity.getNom() );
        userDTO.prenom( entity.getPrenom() );
        userDTO.email( entity.getEmail() );
        userDTO.photo( entity.getPhoto() );
        userDTO.telephone( entity.getTelephone() );
        userDTO.role( entity.getRole() );
        userDTO.actif( entity.getActif() );
        userDTO.dateCreation( entity.getDateCreation() );

        return userDTO.build();
    }

    @Override
    public void updateEntityFromDTO(UtilisateurUpdateDTO dto, Utilisateur entity) {
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
    }

    @Override
    public void updateEntityFromUpdateMeDTO(UpdateMeDTO dto, Utilisateur entity) {
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
    }
}
