package com.unievt.mapper;

import com.unievt.dto.EtudiantCreateDTO;
import com.unievt.dto.EtudiantResponseDTO;
import com.unievt.dto.EtudiantUpdateDTO;
import com.unievt.entity.Etudiant;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EtudiantMapper {

    Etudiant toEntity(EtudiantCreateDTO dto);

    EtudiantResponseDTO toResponseDTO(Etudiant entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(EtudiantUpdateDTO dto, @MappingTarget Etudiant entity);
}
