package com.unievt.mapper;

import com.unievt.dto.SalleDTO;
import com.unievt.dto.SalleResponseDTO;
import com.unievt.entity.Salle;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-16T16:53:14+0100",
    comments = "version: 1.6.3, compiler: javac, environment: Java 25.0.1 (Oracle Corporation)"
)
@Component
public class SalleMapperImpl implements SalleMapper {

    @Override
    public Salle toEntity(SalleDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Salle.SalleBuilder<?, ?> salle = Salle.builder();

        salle.nom( dto.getNom() );
        salle.batiment( dto.getBatiment() );
        salle.etage( dto.getEtage() );
        salle.capacite( dto.getCapacite() );
        salle.type( dto.getType() );
        List<String> list = dto.getEquipements();
        if ( list != null ) {
            salle.equipements( new ArrayList<String>( list ) );
        }
        salle.accessiblePMR( dto.getAccessiblePMR() );
        salle.statut( dto.getStatut() );
        List<String> list1 = dto.getPhotos();
        if ( list1 != null ) {
            salle.photos( new ArrayList<String>( list1 ) );
        }

        return salle.build();
    }

    @Override
    public SalleResponseDTO toResponseDTO(Salle entity) {
        if ( entity == null ) {
            return null;
        }

        SalleResponseDTO.SalleResponseDTOBuilder salleResponseDTO = SalleResponseDTO.builder();

        salleResponseDTO.id( entity.getId() );
        salleResponseDTO.nom( entity.getNom() );
        salleResponseDTO.batiment( entity.getBatiment() );
        salleResponseDTO.etage( entity.getEtage() );
        salleResponseDTO.capacite( entity.getCapacite() );
        salleResponseDTO.type( entity.getType() );
        List<String> list = entity.getEquipements();
        if ( list != null ) {
            salleResponseDTO.equipements( new ArrayList<String>( list ) );
        }
        salleResponseDTO.accessiblePMR( entity.getAccessiblePMR() );
        salleResponseDTO.statut( entity.getStatut() );
        List<String> list1 = entity.getPhotos();
        if ( list1 != null ) {
            salleResponseDTO.photos( new ArrayList<String>( list1 ) );
        }

        return salleResponseDTO.build();
    }

    @Override
    public void updateEntityFromDTO(SalleDTO dto, Salle entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getNom() != null ) {
            entity.setNom( dto.getNom() );
        }
        if ( dto.getBatiment() != null ) {
            entity.setBatiment( dto.getBatiment() );
        }
        if ( dto.getEtage() != null ) {
            entity.setEtage( dto.getEtage() );
        }
        if ( dto.getCapacite() != null ) {
            entity.setCapacite( dto.getCapacite() );
        }
        if ( dto.getType() != null ) {
            entity.setType( dto.getType() );
        }
        if ( entity.getEquipements() != null ) {
            List<String> list = dto.getEquipements();
            if ( list != null ) {
                entity.getEquipements().clear();
                entity.getEquipements().addAll( list );
            }
        }
        else {
            List<String> list = dto.getEquipements();
            if ( list != null ) {
                entity.setEquipements( new ArrayList<String>( list ) );
            }
        }
        if ( dto.getAccessiblePMR() != null ) {
            entity.setAccessiblePMR( dto.getAccessiblePMR() );
        }
        if ( dto.getStatut() != null ) {
            entity.setStatut( dto.getStatut() );
        }
        if ( entity.getPhotos() != null ) {
            List<String> list1 = dto.getPhotos();
            if ( list1 != null ) {
                entity.getPhotos().clear();
                entity.getPhotos().addAll( list1 );
            }
        }
        else {
            List<String> list1 = dto.getPhotos();
            if ( list1 != null ) {
                entity.setPhotos( new ArrayList<String>( list1 ) );
            }
        }
    }
}
