package com.unievt;

import com.unievt.enums.RoleEnum;
import com.unievt.user.entity.Etudiant;
import com.unievt.user.entity.Utilisateur;
import com.unievt.user.repository.EtudiantRepository;
import com.unievt.user.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class UniEventBackendApplicationTests {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Test
    void testSaveUtilisateur() {
        Utilisateur u = Utilisateur.builder()
                .nom("Benali")
                .prenom("Ahmed")
                .email("ahmed.benali@unievt.ma")
                .motDePasse("secret123")
                .role(RoleEnum.ADMIN)
                .actif(true)
                .build();

        Utilisateur saved = utilisateurRepository.save(u);
        assertNotNull(saved.getId());
        System.out.println("Utilisateur saved with id: " + saved.getId());
    }

    @Test
    void testSaveEtudiant() {
        Etudiant e = Etudiant.builder()
                .nom("Alaoui")
                .prenom("Fatima")
                .email("fatima.alaoui@unievt.ma")
                .motDePasse("secret123")
                .role(RoleEnum.ETUDIANT)
                .actif(true)
                .filiere("Génie Informatique")
                .anneeEtude(2)
                .cin("AB123456")
                .build();

        Etudiant saved = etudiantRepository.save(e);
        assertNotNull(saved.getId());
        System.out.println("Etudiant saved with id: " + saved.getId());
    }
}
