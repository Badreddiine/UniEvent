package com.unievt.mapper;

import com.unievt.dto.EvenementIntervenantCreateDTO;
import com.unievt.dto.EvenementIntervenantResponseDTO;
import com.unievt.entity.Evenement;
import com.unievt.entity.EvenementIntervenant;
import com.unievt.entity.Intervenant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T18:09:39+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class EvenementIntervenantMapperImpl implements EvenementIntervenantMapper {

    @Override
    public EvenementIntervenant toEntity(EvenementIntervenantCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        EvenementIntervenant.EvenementIntervenantBuilder evenementIntervenant = EvenementIntervenant.builder();

        evenementIntervenant.evenement( evenementIntervenantCreateDTOToEvenement( dto ) );
        evenementIntervenant.intervenant( evenementIntervenantCreateDTOToIntervenant( dto ) );

        evenementIntervenant.id( new com.unievt.entity.EvenementIntervenantId(dto.getEvenementId(), dto.getIntervenantId()) );

        return evenementIntervenant.build();
    }

    @Override
    public EvenementIntervenantResponseDTO toResponseDTO(EvenementIntervenant entity) {
        if ( entity == null ) {
            return null;
        }

        EvenementIntervenantResponseDTO evenementIntervenantResponseDTO = new EvenementIntervenantResponseDTO();

        evenementIntervenantResponseDTO.setEvenementId( entity.getEvenement()!=null? entity.getEvenement().getId(): null );
        evenementIntervenantResponseDTO.setIntervenantId( entity.getIntervenant()!=null? entity.getIntervenant().getId(): null );
        evenementIntervenantResponseDTO.setIntervenantName( entity.getIntervenant()!=null? entity.getIntervenant().toString(): null );
        evenementIntervenantResponseDTO.setEvenementTitle( entity.getEvenement()!=null? entity.getEvenement().toString(): null );

        return evenementIntervenantResponseDTO;
    }

    protected Evenement evenementIntervenantCreateDTOToEvenement(EvenementIntervenantCreateDTO evenementIntervenantCreateDTO) {
        if ( evenementIntervenantCreateDTO == null ) {
            return null;
        }

        Evenement.EvenementBuilder<?, ?> evenement = Evenement.builder();

        evenement.id( evenementIntervenantCreateDTO.getEvenementId() );

        return evenement.build();
    }

    protected Intervenant evenementIntervenantCreateDTOToIntervenant(EvenementIntervenantCreateDTO evenementIntervenantCreateDTO) {
        if ( evenementIntervenantCreateDTO == null ) {
            return null;
        }

        Intervenant.IntervenantBuilder<?, ?> intervenant = Intervenant.builder();

        intervenant.id( evenementIntervenantCreateDTO.getIntervenantId() );

        return intervenant.build();
    }
}
