package com.unievt.mapper;

import com.unievt.dto.IntervenantDTO;
import com.unievt.dto.IntervenantResponseDTO;
import com.unievt.dto.IntervenantUpdateDTO;
import com.unievt.entity.Intervenant;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface IntervenantMapper {

    Intervenant toEntity(IntervenantDTO dto);

    IntervenantResponseDTO toResponseDTO(Intervenant entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(IntervenantUpdateDTO dto, @MappingTarget Intervenant entity);
}