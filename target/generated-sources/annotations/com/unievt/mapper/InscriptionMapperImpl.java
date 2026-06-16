package com.unievt.mapper;

import com.unievt.dto.InscriptionCreateDTO;
import com.unievt.dto.InscriptionResponseDTO;
import com.unievt.dto.InscriptionUpdateDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Inscription;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:09:39+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class InscriptionMapperImpl implements InscriptionMapper {

    @Override
    public Inscription toEntity(InscriptionCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Inscription.InscriptionBuilder<?, ?> inscription = Inscription.builder();

        inscription.etudiant( inscriptionCreateDTOToUtilisateur( dto ) );
        inscription.evenement( inscriptionCreateDTOToEvenement( dto ) );
        inscription.dateInscription( dto.getDateInscription() );
        inscription.statut( dto.getStatut() );
        inscription.qrCode( dto.getQrCode() );
        inscription.present( dto.getPresent() );

        return inscription.build();
    }

    @Override
    public InscriptionResponseDTO toResponseDTO(Inscription inscription) {
        if ( inscription == null ) {
            return null;
        }

        InscriptionResponseDTO inscriptionResponseDTO = new InscriptionResponseDTO();

        inscriptionResponseDTO.setId( inscription.getId() );
        inscriptionResponseDTO.setDateInscription( inscription.getDateInscription() );
        inscriptionResponseDTO.setStatut( inscription.getStatut() );
        inscriptionResponseDTO.setQrCode( inscription.getQrCode() );
        inscriptionResponseDTO.setPresent( inscription.getPresent() );

        inscriptionResponseDTO.setEtudiantId( inscription.getEtudiant()!=null? inscription.getEtudiant().getId() : null );
        inscriptionResponseDTO.setEtudiantName( inscription.getEtudiant()!=null? inscription.getEtudiant().toString() : null );
        inscriptionResponseDTO.setEvenementId( inscription.getEvenement()!=null? inscription.getEvenement().getId() : null );
        inscriptionResponseDTO.setEvenementTitle( inscription.getEvenement()!=null? inscription.getEvenement().toString() : null );

        return inscriptionResponseDTO;
    }

    @Override
    public void updateEntityFromDTO(InscriptionUpdateDTO dto, Inscription entity) {
        if ( dto == null ) {
            return;
        }

        entity.setStatut( dto.getStatut() );
    }

    protected Utilisateur inscriptionCreateDTOToUtilisateur(InscriptionCreateDTO inscriptionCreateDTO) {
        if ( inscriptionCreateDTO == null ) {
            return null;
        }

        Utilisateur.UtilisateurBuilder<?, ?> utilisateur = Utilisateur.builder();

        utilisateur.id( inscriptionCreateDTO.getEtudiantId() );

        return utilisateur.build();
    }

    protected Evenement inscriptionCreateDTOToEvenement(InscriptionCreateDTO inscriptionCreateDTO) {
        if ( inscriptionCreateDTO == null ) {
            return null;
        }

        Evenement.EvenementBuilder<?, ?> evenement = Evenement.builder();

        evenement.id( inscriptionCreateDTO.getEvenementId() );

        return evenement.build();
    }
}
