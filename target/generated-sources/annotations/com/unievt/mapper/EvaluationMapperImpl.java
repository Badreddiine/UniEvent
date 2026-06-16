package com.unievt.mapper;

import com.unievt.dto.EvaluationDTO;
import com.unievt.dto.EvaluationResponseDTO;
import com.unievt.entity.Evaluation;
import com.unievt.entity.Evenement;
import com.unievt.entity.Reservation;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:37:16+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class EvaluationMapperImpl implements EvaluationMapper {

    @Override
    public Evaluation toEntity(EvaluationDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Evaluation.EvaluationBuilder evaluation = Evaluation.builder();

        evaluation.note( dto.getNote() );
        evaluation.commentaire( dto.getCommentaire() );

        return evaluation.build();
    }

    @Override
    public EvaluationResponseDTO toResponseDTO(Evaluation entity) {
        if ( entity == null ) {
            return null;
        }

        EvaluationResponseDTO.EvaluationResponseDTOBuilder evaluationResponseDTO = EvaluationResponseDTO.builder();

        evaluationResponseDTO.etudiantId( entityEtudiantId( entity ) );
        evaluationResponseDTO.etudiantNom( entityEtudiantNom( entity ) );
        evaluationResponseDTO.etudiantPrenom( entityEtudiantPrenom( entity ) );
        evaluationResponseDTO.reservationId( entityReservationId( entity ) );
        evaluationResponseDTO.evenementId( entityReservationEvenementId( entity ) );
        evaluationResponseDTO.evenementTitre( entityReservationEvenementTitre( entity ) );
        evaluationResponseDTO.id( entity.getId() );
        evaluationResponseDTO.note( entity.getNote() );
        evaluationResponseDTO.commentaire( entity.getCommentaire() );
        evaluationResponseDTO.dateEvaluation( entity.getDateEvaluation() );

        return evaluationResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(EvaluationDTO dto, Evaluation entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getNote() != null ) {
            entity.setNote( dto.getNote() );
        }
        if ( dto.getCommentaire() != null ) {
            entity.setCommentaire( dto.getCommentaire() );
        }
    }

    private Long entityEtudiantId(Evaluation evaluation) {
        Utilisateur etudiant = evaluation.getEtudiant();
        if ( etudiant == null ) {
            return null;
        }
        return etudiant.getId();
    }

    private String entityEtudiantNom(Evaluation evaluation) {
        Utilisateur etudiant = evaluation.getEtudiant();
        if ( etudiant == null ) {
            return null;
        }
        return etudiant.getNom();
    }

    private String entityEtudiantPrenom(Evaluation evaluation) {
        Utilisateur etudiant = evaluation.getEtudiant();
        if ( etudiant == null ) {
            return null;
        }
        return etudiant.getPrenom();
    }

    private Long entityReservationId(Evaluation evaluation) {
        Reservation reservation = evaluation.getReservation();
        if ( reservation == null ) {
            return null;
        }
        return reservation.getId();
    }

    private Long entityReservationEvenementId(Evaluation evaluation) {
        Reservation reservation = evaluation.getReservation();
        if ( reservation == null ) {
            return null;
        }
        Evenement evenement = reservation.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getId();
    }

    private String entityReservationEvenementTitre(Evaluation evaluation) {
        Reservation reservation = evaluation.getReservation();
        if ( reservation == null ) {
            return null;
        }
        Evenement evenement = reservation.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getTitre();
    }
}
