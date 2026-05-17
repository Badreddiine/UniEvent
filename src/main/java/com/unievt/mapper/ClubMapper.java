package com.unievt.mapper;

import com.unievt.dto.ClubCreateDTO;
import com.unievt.dto.ClubResponseDTO;
import com.unievt.dto.ClubUpdateDTO;
import com.unievt.entity.Club;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ClubMapper {

    @Mapping(target = "president", ignore = true)
    Club toEntity(ClubCreateDTO dto);

    @Mapping(source = "president.id", target = "presidentId")
    @Mapping(source = "president.nom", target = "presidentNom")
    @Mapping(source = "president.prenom", target = "presidentPrenom")
    ClubResponseDTO toResponseDTO(Club entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "president", ignore = true)
    void updateEntityFromDTO(ClubUpdateDTO dto, @MappingTarget Club entity);
}