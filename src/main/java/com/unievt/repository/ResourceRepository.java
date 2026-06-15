package com.unievt.repository;

import com.unievt.entity.Resource;
import com.unievt.enums.TypeRessourceEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    List<Resource> findBySalleId(Long salleId);

    List<Resource> findByType(TypeRessourceEnum type);

    List<Resource> findByDisponibleTrue();
}
