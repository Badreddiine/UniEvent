package com.unievt.repository;

import com.unievt.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByActifTrue();
    List<Club> findByCategorie(String categorie);
}
