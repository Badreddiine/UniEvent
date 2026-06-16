package com.unievt.mapper;

import com.unievt.dto.ClubCreateDTO;
import com.unievt.dto.ClubResponseDTO;
import com.unievt.dto.ClubUpdateDTO;
import com.unievt.entity.Club;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:58:19+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class ClubMapperImpl implements ClubMapper {

    @Override
    public Club toEntity(ClubCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Club.ClubBuilder club = Club.builder();

        club.nom( dto.getNom() );
        club.description( dto.getDescription() );
        club.categorie( dto.getCategorie() );
        club.logo( dto.getLogo() );

        return club.build();
    }

    @Override
    public ClubResponseDTO toResponseDTO(Club entity) {
        if ( entity == null ) {
            return null;
        }

        ClubResponseDTO.ClubResponseDTOBuilder clubResponseDTO = ClubResponseDTO.builder();

        clubResponseDTO.presidentId( entityPresidentId( entity ) );
        clubResponseDTO.presidentNom( entityPresidentNom( entity ) );
        clubResponseDTO.presidentPrenom( entityPresidentPrenom( entity ) );
        clubResponseDTO.id( entity.getId() );
        clubResponseDTO.nom( entity.getNom() );
        clubResponseDTO.description( entity.getDescription() );
        clubResponseDTO.categorie( entity.getCategorie() );
        clubResponseDTO.logo( entity.getLogo() );
        clubResponseDTO.dateCreation( entity.getDateCreation() );
        clubResponseDTO.actif( entity.getActif() );

        return clubResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(ClubUpdateDTO dto, Club entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getNom() != null ) {
            entity.setNom( dto.getNom() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getCategorie() != null ) {
            entity.setCategorie( dto.getCategorie() );
        }
        if ( dto.getLogo() != null ) {
            entity.setLogo( dto.getLogo() );
        }
        if ( dto.getActif() != null ) {
            entity.setActif( dto.getActif() );
        }
    }

    private Long entityPresidentId(Club club) {
        Utilisateur president = club.getPresident();
        if ( president == null ) {
            return null;
        }
        return president.getId();
    }

    private String entityPresidentNom(Club club) {
        Utilisateur president = club.getPresident();
        if ( president == null ) {
            return null;
        }
        return president.getNom();
    }

    private String entityPresidentPrenom(Club club) {
        Utilisateur president = club.getPresident();
        if ( president == null ) {
            return null;
        }
        return president.getPrenom();
    }
}
