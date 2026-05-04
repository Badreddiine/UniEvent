package com.unievt.event.mapper;

import com.unievt.event.dto.IntervenantDTO;
import com.unievt.event.dto.IntervenantResponseDTO;
import com.unievt.event.dto.IntervenantUpdateDTO;
import com.unievt.event.entity.Intervenant;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface IntervenantMapper {

    Intervenant toEntity(IntervenantDTO dto);

    IntervenantResponseDTO toResponseDTO(Intervenant entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(IntervenantUpdateDTO dto, @MappingTarget Intervenant entity);
}