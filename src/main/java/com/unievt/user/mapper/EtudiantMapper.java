package com.unievt.user.mapper;

import com.unievt.user.dto.EtudiantCreateDTO;
import com.unievt.user.dto.EtudiantResponseDTO;
import com.unievt.user.dto.EtudiantUpdateDTO;
import com.unievt.user.entity.Etudiant;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EtudiantMapper {

    Etudiant toEntity(EtudiantCreateDTO dto);

    EtudiantResponseDTO toResponseDTO(Etudiant entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(EtudiantUpdateDTO dto, @MappingTarget Etudiant entity);
}
