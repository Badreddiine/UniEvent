package com.unievt.mapper;

import com.unievt.dto.IntervenantDTO;
import com.unievt.dto.IntervenantResponseDTO;
import com.unievt.dto.IntervenantUpdateDTO;
import com.unievt.entity.Intervenant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T16:53:14+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class IntervenantMapperImpl implements IntervenantMapper {

    @Override
    public Intervenant toEntity(IntervenantDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Intervenant.IntervenantBuilder<?, ?> intervenant = Intervenant.builder();

        intervenant.nom( dto.getNom() );
        intervenant.institution( dto.getInstitution() );
        intervenant.biographie( dto.getBiographie() );

        return intervenant.build();
    }

    @Override
    public IntervenantResponseDTO toResponseDTO(Intervenant entity) {
        if ( entity == null ) {
            return null;
        }

        IntervenantResponseDTO.IntervenantResponseDTOBuilder intervenantResponseDTO = IntervenantResponseDTO.builder();

        intervenantResponseDTO.id( entity.getId() );
        intervenantResponseDTO.nom( entity.getNom() );
        intervenantResponseDTO.institution( entity.getInstitution() );
        intervenantResponseDTO.biographie( entity.getBiographie() );

        return intervenantResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(IntervenantUpdateDTO dto, Intervenant entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getNom() != null ) {
            entity.setNom( dto.getNom() );
        }
        if ( dto.getInstitution() != null ) {
            entity.setInstitution( dto.getInstitution() );
        }
        if ( dto.getBiographie() != null ) {
            entity.setBiographie( dto.getBiographie() );
        }
    }
}
