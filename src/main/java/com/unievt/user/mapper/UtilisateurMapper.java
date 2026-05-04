package com.unievt.user.mapper;

import com.unievt.user.dto.UtilisateurCreateDTO;
import com.unievt.user.dto.UtilisateurResponseDTO;
import com.unievt.user.entity.Utilisateur;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UtilisateurMapper {

    Utilisateur toEntity(UtilisateurCreateDTO dto);

    UtilisateurResponseDTO toResponseDTO(Utilisateur entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(UtilisateurCreateDTO dto, @MappingTarget Utilisateur entity);
}
