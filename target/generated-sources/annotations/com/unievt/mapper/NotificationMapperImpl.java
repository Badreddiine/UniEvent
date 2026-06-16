package com.unievt.mapper;

import com.unievt.dto.NotificationDTO;
import com.unievt.dto.NotificationResponseDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.Notification;
import com.unievt.entity.Utilisateur;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T16:53:14+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public Notification toEntity(NotificationDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.titre( dto.getTitre() );
        notification.message( dto.getMessage() );
        notification.type( dto.getType() );

        return notification.build();
    }

    @Override
    public NotificationResponseDTO toResponseDTO(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationResponseDTO.NotificationResponseDTOBuilder notificationResponseDTO = NotificationResponseDTO.builder();

        notificationResponseDTO.destinataireId( entityDestinataireId( entity ) );
        notificationResponseDTO.destinataireNom( entityDestinataireNom( entity ) );
        notificationResponseDTO.destinatairePrenom( entityDestinatairePrenom( entity ) );
        notificationResponseDTO.evenementId( entityEvenementId( entity ) );
        notificationResponseDTO.evenementTitre( entityEvenementTitre( entity ) );
        notificationResponseDTO.id( entity.getId() );
        notificationResponseDTO.titre( entity.getTitre() );
        notificationResponseDTO.message( entity.getMessage() );
        notificationResponseDTO.type( entity.getType() );
        notificationResponseDTO.lu( entity.getLu() );
        notificationResponseDTO.dateEnvoi( entity.getDateEnvoi() );

        return notificationResponseDTO.build();
    }

    private Long entityDestinataireId(Notification notification) {
        Utilisateur destinataire = notification.getDestinataire();
        if ( destinataire == null ) {
            return null;
        }
        return destinataire.getId();
    }

    private String entityDestinataireNom(Notification notification) {
        Utilisateur destinataire = notification.getDestinataire();
        if ( destinataire == null ) {
            return null;
        }
        return destinataire.getNom();
    }

    private String entityDestinatairePrenom(Notification notification) {
        Utilisateur destinataire = notification.getDestinataire();
        if ( destinataire == null ) {
            return null;
        }
        return destinataire.getPrenom();
    }

    private Long entityEvenementId(Notification notification) {
        Evenement evenement = notification.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getId();
    }

    private String entityEvenementTitre(Notification notification) {
        Evenement evenement = notification.getEvenement();
        if ( evenement == null ) {
            return null;
        }
        return evenement.getTitre();
    }
}
