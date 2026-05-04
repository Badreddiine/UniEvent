package com.unievt.user.repository;

import com.unievt.user.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    Optional<Etudiant> findByCin(String cin);
}
