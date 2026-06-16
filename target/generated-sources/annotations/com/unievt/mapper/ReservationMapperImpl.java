package com.unievt.mapper;

import com.unievt.dto.ReservationDTO;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Reservation;
import com.unievt.entity.Salle;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T16:53:14+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class ReservationMapperImpl implements ReservationMapper {

    @Override
    public Reservation toEntity(ReservationDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Reservation.ReservationBuilder reservation = Reservation.builder();

        reservation.dateDebut( dto.getDateDebut() );
        reservation.dateFin( dto.getDateFin() );
        reservation.commentaire( dto.getCommentaire() );

        return reservation.build();
    }

    @Override
    public ReservationResponseDTO toResponseDTO(Reservation entity) {
        if ( entity == null ) {
            return null;
        }

        ReservationResponseDTO.ReservationResponseDTOBuilder reservationResponseDTO = ReservationResponseDTO.builder();

        reservationResponseDTO.evenementId( entityEvenementId( entity ) );
        reservationResponseDTO.evenementTitre( entityEvenementTitre( entity ) );
        reservationResponseDTO.salleId( entitySalleId( entity ) );
        reservationResponseDTO.salleNom( entitySalleNom( entity ) );
        reservationResponseDTO.demandeurId( entityDemandeurId( entity ) );
        reservationResponseDTO.demandeurNom( entityDemandeurNom( entity ) );
        reservationResponseDTO.demandeurPrenom( entityDemandeurPrenom( entity ) );
        reservationResponseDTO.approbateurId( entityApprobateurId( entity ) );
        reservationResponseDTO.approbateurNom( entityApprobateurNom( entity ) );
        reservationResponseDTO.id( entity.getId() );
        reservationResponseDTO.dateDebut( entity.getDateDebut() );
        reservationResponseDTO.dateFin( entity.getDateFin() );
        reservationResponseDTO.statut( entity.getStatut() );
        reservationResponseDTO.commentaire( entity.getCommentaire() );
        reservationResponseDTO.dateCreation( entity.getDateCreation() );

        return reservationResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(ReservationDTO dto, Reservation entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getDateDebut() != null ) {
            entity.setDateDebut( dto.getDateDebut() );
        }
        if ( dto.getDateFin() != null ) {
            entity.setDateFin( dto.getDateFin() );
        }
        if ( dto.getCommentaire() != null ) {
            entity.setCommentaire( dto.getCommentaire() );
        }
    }

    private Long entityEvenementId(Reservation reservation) {
        Evenement evenement = reservation.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getId();
    }

    private String entityEvenementTitre(Reservation reservation) {
        Evenement evenement = reservation.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getTitre();
    }

    private Long entitySalleId(Reservation reservation) {
        Salle salle = reservation.getSalle();
        if ( salle == null ) {
            return null;
        }
        return salle.getId();
    }

    private String entitySalleNom(Reservation reservation) {
        Salle salle = reservation.getSalle();
        if ( salle == null ) {
            return null;
        }
        return salle.getNom();
    }

    private Long entityDemandeurId(Reservation reservation) {
        Utilisateur demandeur = reservation.getDemandeur();
        if ( demandeur == null ) {
            return null;
        }
        return demandeur.getId();
    }

    private String entityDemandeurNom(Reservation reservation) {
        Utilisateur demandeur = reservation.getDemandeur();
        if ( demandeur == null ) {
            return null;
        }
        return demandeur.getNom();
    }

    private String entityDemandeurPrenom(Reservation reservation) {
        Utilisateur demandeur = reservation.getDemandeur();
        if ( demandeur == null ) {
            return null;
        }
        return demandeur.getPrenom();
    }

    private Long entityApprobateurId(Reservation reservation) {
        Utilisateur approbateur = reservation.getApprobateur();
        if ( approbateur == null ) {
            return null;
        }
        return approbateur.getId();
    }

    private String entityApprobateurNom(Reservation reservation) {
        Utilisateur approbateur = reservation.getApprobateur();
        if ( approbateur == null ) {
            return null;
        }
        return approbateur.getNom();
    }
}
