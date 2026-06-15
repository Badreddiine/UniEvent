package com.unievt.repository;

import com.unievt.entity.Partner;
import com.unievt.enums.TypePartenaireEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, UUID> {

    List<Partner> findByActifTrue();

    List<Partner> findByType(TypePartenaireEnum type);

    boolean existsByNom(String nom);
}
