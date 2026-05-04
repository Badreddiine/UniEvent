package com.unievt.event.mapper;

import com.unievt.event.dto.EvenementIntervenantCreateDTO;
import com.unievt.event.dto.EvenementIntervenantResponseDTO;
import com.unievt.event.entity.EvenementIntervenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EvenementIntervenantMapper {

    @Mapping(target = "id", expression = "java(new com.unievt.event.entity.EvenementIntervenantId(dto.getEvenementId(), dto.getIntervenantId()))")
    @Mapping(target = "evenement.id", source = "evenementId")
    @Mapping(target = "intervenant.id", source = "intervenantId")
    EvenementIntervenant toEntity(EvenementIntervenantCreateDTO dto);

    @Mapping(target = "evenementId", expression = "java(entity.getEvenement()!=null? entity.getEvenement().getId(): null)")
    @Mapping(target = "intervenantId", expression = "java(entity.getIntervenant()!=null? entity.getIntervenant().getId(): null)")
    @Mapping(target = "intervenantName", expression = "java(entity.getIntervenant()!=null? entity.getIntervenant().toString(): null)")
    @Mapping(target = "evenementTitle", expression = "java(entity.getEvenement()!=null? entity.getEvenement().toString(): null)")
    EvenementIntervenantResponseDTO toResponseDTO(EvenementIntervenant entity);
}
