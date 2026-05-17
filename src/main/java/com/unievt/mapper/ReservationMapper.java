package com.unievt.mapper;

import com.unievt.dto.ReservationDTO;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.entity.Reservation;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(target = "salle", ignore = true)
    @Mapping(target = "evenement", ignore = true)
    @Mapping(target = "demandeur", ignore = true)
    @Mapping(target = "approbateur", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "statut", ignore = true)
    @Mapping(target = "dateCreation", ignore = true)
    Reservation toEntity(ReservationDTO dto);

    @Mapping(source = "evenement.id", target = "evenementId")
    @Mapping(source = "evenement.titre", target = "evenementTitre")
    @Mapping(source = "salle.id", target = "salleId")
    @Mapping(source = "salle.nom", target = "salleNom")
    @Mapping(source = "demandeur.id", target = "demandeurId")
    @Mapping(source = "demandeur.nom", target = "demandeurNom")
    @Mapping(source = "demandeur.prenom", target = "demandeurPrenom")
    @Mapping(source = "approbateur.id", target = "approbateurId")
    @Mapping(source = "approbateur.nom", target = "approbateurNom")
    ReservationResponseDTO toResponseDTO(Reservation entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "salle", ignore = true)
    @Mapping(target = "evenement", ignore = true)
    @Mapping(target = "demandeur", ignore = true)
    @Mapping(target = "approbateur", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "statut", ignore = true)
    @Mapping(target = "dateCreation", ignore = true)
    void updateEntityFromDTO(ReservationDTO dto, @MappingTarget Reservation entity);
}
