package com.unievt.mapper;

import com.unievt.dto.EvenementCreateDTO;
import com.unievt.dto.EvenementResponseDTO;
import com.unievt.dto.EvenementUpdateDTO;
import com.unievt.entity.Club;
import com.unievt.entity.Evenement;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-15T21:10:02+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class EvenementMapperImpl implements EvenementMapper {

    @Override
    public Evenement toEntity(EvenementCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Evenement.EvenementBuilder<?, ?> evenement = Evenement.builder();

        evenement.club( evenementCreateDTOToClub( dto ) );
        evenement.organisateur( evenementCreateDTOToUtilisateur( dto ) );
        evenement.titre( dto.getTitre() );
        evenement.description( dto.getDescription() );
        evenement.categorie( dto.getCategorie() );
        evenement.dateDebut( dto.getDateDebut() );
        evenement.dateFin( dto.getDateFin() );
        evenement.capacite( dto.getCapacite() );
        evenement.affiche( dto.getAffiche() );
        evenement.statut( dto.getStatut() );
        evenement.visibilite( dto.getVisibilite() );
        evenement.type( dto.getType() );
        evenement.lienVisio( dto.getLienVisio() );

        return evenement.build();
    }

    @Override
    public EvenementResponseDTO toResponseDTO(Evenement evenement) {
        if ( evenement == null ) {
            return null;
        }

        EvenementResponseDTO evenementResponseDTO = new EvenementResponseDTO();

        evenementResponseDTO.setId( evenement.getId() );
        evenementResponseDTO.setTitre( evenement.getTitre() );
        evenementResponseDTO.setDescription( evenement.getDescription() );
        evenementResponseDTO.setCategorie( evenement.getCategorie() );
        evenementResponseDTO.setDateDebut( evenement.getDateDebut() );
        evenementResponseDTO.setDateFin( evenement.getDateFin() );
        evenementResponseDTO.setCapacite( evenement.getCapacite() );
        evenementResponseDTO.setAffiche( evenement.getAffiche() );
        evenementResponseDTO.setStatut( evenement.getStatut() );
        evenementResponseDTO.setVisibilite( evenement.getVisibilite() );
        evenementResponseDTO.setType( evenement.getType() );
        evenementResponseDTO.setLienVisio( evenement.getLienVisio() );

        evenementResponseDTO.setClubId( evenement.getClub()!=null? evenement.getClub().getId() : null );
        evenementResponseDTO.setClubName( evenement.getClub()!=null? evenement.getClub().toString() : null );
        evenementResponseDTO.setOrganisateurId( evenement.getOrganisateur()!=null? evenement.getOrganisateur().getId() : null );
        evenementResponseDTO.setOrganisateurName( evenement.getOrganisateur()!=null? evenement.getOrganisateur().toString() : null );

        return evenementResponseDTO;
    }

    @Override
    public void updateEntityFromDTO(EvenementUpdateDTO dto, Evenement entity) {
        if ( dto == null ) {
            return;
        }

        entity.setStatut( dto.getStatut() );
    }

    protected Club evenementCreateDTOToClub(EvenementCreateDTO evenementCreateDTO) {
        if ( evenementCreateDTO == null ) {
            return null;
        }

        Club.ClubBuilder club = Club.builder();

        club.id( evenementCreateDTO.getClubId() );

        return club.build();
    }

    protected Utilisateur evenementCreateDTOToUtilisateur(EvenementCreateDTO evenementCreateDTO) {
        if ( evenementCreateDTO == null ) {
            return null;
        }

        Utilisateur.UtilisateurBuilder<?, ?> utilisateur = Utilisateur.builder();

        utilisateur.id( evenementCreateDTO.getOrganisateurId() );

        return utilisateur.build();
    }
}
