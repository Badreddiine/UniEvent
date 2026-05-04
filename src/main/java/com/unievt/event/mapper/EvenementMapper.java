package com.unievt.event.mapper;

import com.unievt.event.dto.EvenementCreateDTO;
import com.unievt.event.dto.EvenementResponseDTO;
import com.unievt.event.dto.EvenementUpdateDTO;
import com.unievt.event.entity.Evenement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EvenementMapper {

    @Mapping(target = "club.id", source = "clubId")
    @Mapping(target = "organisateur.id", source = "organisateurId")
    Evenement toEntity(EvenementCreateDTO dto);

    @Mapping(target = "clubId", expression = "java(evenement.getClub()!=null? evenement.getClub().getId() : null)")
    @Mapping(target = "clubName", expression = "java(evenement.getClub()!=null? evenement.getClub().toString() : null)")
    @Mapping(target = "organisateurId", expression = "java(evenement.getOrganisateur()!=null? evenement.getOrganisateur().getId() : null)")
    @Mapping(target = "organisateurName", expression = "java(evenement.getOrganisateur()!=null? evenement.getOrganisateur().toString() : null)")
    EvenementResponseDTO toResponseDTO(Evenement evenement);

    void updateEntityFromDTO(EvenementUpdateDTO dto, @MappingTarget Evenement entity);
}
