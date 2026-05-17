package com.unievt.mapper;

import com.unievt.dto.UtilisateurCreateDTO;
import com.unievt.dto.UtilisateurResponseDTO;
import com.unievt.dto.UtilisateurUpdateDTO;
import com.unievt.entity.Utilisateur;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UtilisateurMapper {

    Utilisateur toEntity(UtilisateurCreateDTO dto);

    UtilisateurResponseDTO toResponseDTO(Utilisateur entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(UtilisateurUpdateDTO dto, @MappingTarget Utilisateur entity);
}
