package com.unievt.mapper;

import com.unievt.dto.SalleDTO;
import com.unievt.dto.SalleResponseDTO;
import com.unievt.entity.Salle;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SalleMapper {

    Salle toEntity(SalleDTO dto);

    SalleResponseDTO toResponseDTO(Salle entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(SalleDTO dto, @MappingTarget Salle entity);
}
