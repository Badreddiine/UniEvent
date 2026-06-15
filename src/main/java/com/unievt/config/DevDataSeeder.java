package com.unievt.config;

import com.unievt.entity.*;
import com.unievt.enums.*;
import com.unievt.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Peuple la base avec un jeu de données réaliste au premier démarrage.
 *
 * <p>Conçu pour permettre à Abdelhamid (et aux autres) de tester rapidement
 * leurs APIs sans avoir à créer manuellement les FK dont leurs endpoints
 * dépendent (utilisateurs, salles, clubs, étudiants, intervenants).
 *
 * <p><strong>Idempotent :</strong> si la table {@code utilisateur} contient
 * déjà au moins une ligne, le seeder ne fait rien. Pour repeupler depuis zéro :
 * <pre>
 *   docker exec -it &lt;postgres-container&gt; psql -U unievt -d unievtdb \
 *     -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO unievt;"
 * </pre>
 * puis redémarrer l'app.
 *
 * <p>Mot de passe par défaut pour tous les comptes : <strong>password</strong>
 * (hashé en BCrypt avant insertion).
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final EtudiantRepository etudiantRepository;
    private final ClubRepository clubRepository;
    private final SalleRepository salleRepository;
    private final IntervenantRepository intervenantRepository;
    private final EvenementRepository evenementRepository;
    private final EvenementIntervenantRepository evenementIntervenantRepository;
    private final InscriptionRepository inscriptionRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;
    private final EvaluationRepository evaluationRepository;

    private final PasswordEncoder passwordEncoder;
    private static final String DEFAULT_PASSWORD = "password";

    @Override
    @Transactional
    public void run(String... args) {
        if (utilisateurRepository.count() > 0) {
            log.info("Données déjà présentes ({} utilisateurs) — seeder ignoré.",
                    utilisateurRepository.count());
            return;
        }

        log.info("Base vide → insertion du jeu de données de démo…");

        // ── 1. Utilisateurs avec rôles (admin / doyen / responsable) ─────────
        Utilisateur admin = saveUser("Bensaid", "Khalid",
                "admin@unievt.ma", "+212600000001", RoleEnum.ADMIN);
        Utilisateur doyen = saveUser("El Yacoubi", "Hassan",
                "doyen@unievt.ma", "+212600000002", RoleEnum.DOYEN);
        Utilisateur respEvts = saveUser("Cherkaoui", "Nadia",
                "nadia.cherkaoui@unievt.ma", "+212600000003", RoleEnum.RESPONSABLE_EVENEMENTS);

        // ── 2. Utilisateurs sans rôle (futurs présidents de club, organisateurs) ─
        Utilisateur presClub1 = saveUser("Bennani", "Yassine",
                "yassine.bennani@unievt.ma", "+212600000004", null);
        Utilisateur presClub2 = saveUser("Talbi", "Mehdi",
                "mehdi.talbi@unievt.ma", "+212600000005", null);
        Utilisateur presClub3 = saveUser("Hassoub", "Anas",
                "anas.hassoub@unievt.ma", "+212600000006", null);

        // ── 3. Étudiants ────────────────────────────────────────────────────
        Etudiant etu1 = saveEtudiant("Alaoui", "Sara", "sara.alaoui@unievt.ma",
                "+212600000010", "GINF", 3, "AB123001");
        Etudiant etu2 = saveEtudiant("Ziani", "Mehdi", "mehdi.ziani@unievt.ma",
                "+212600000011", "GINF", 2, "AB123002");
        Etudiant etu3 = saveEtudiant("Belkaid", "Fatima", "fatima.belkaid@unievt.ma",
                "+212600000012", "Génie Civil", 4, "AB123003");
        Etudiant etu4 = saveEtudiant("Mansouri", "Yassir", "yassir.mansouri@unievt.ma",
                "+212600000013", "Génie Industriel", 1, "AB123004");
        Etudiant etu5 = saveEtudiant("Idrissi", "Salma", "salma.idrissi@unievt.ma",
                "+212600000014", "Génie Mécanique", 5, "AB123005");
        Etudiant etu6 = saveEtudiant("El Amrani", "Othmane", "othmane.elamrani@unievt.ma",
                "+212600000015", "GINF", 3, "AB123006");

        // ── 4. Salles ───────────────────────────────────────────────────────
        Salle amphiA = salleRepository.save(Salle.builder()
                .nom("Amphi A").batiment("B1").etage(0).capacite(250)
                .type(TypeSalleEnum.AMPHI).accessiblePMR(true)
                .equipements(List.of("Projecteur", "Sonorisation", "Micro HF"))
                .statut(StatutSalleEnum.DISPONIBLE).build());
        Salle amphiB = salleRepository.save(Salle.builder()
                .nom("Amphi B").batiment("B1").etage(0).capacite(180)
                .type(TypeSalleEnum.AMPHI).accessiblePMR(true)
                .equipements(List.of("Projecteur", "Sonorisation"))
                .statut(StatutSalleEnum.DISPONIBLE).build());
        Salle salleConf = salleRepository.save(Salle.builder()
                .nom("Salle de conférence").batiment("B2").etage(2).capacite(60)
                .type(TypeSalleEnum.SALLE_CONFERENCE).accessiblePMR(true)
                .equipements(List.of("Écran 4K", "Visio", "Tableau interactif"))
                .statut(StatutSalleEnum.DISPONIBLE).build());
        Salle salleInfo = salleRepository.save(Salle.builder()
                .nom("Lab Info 1").batiment("B3").etage(1).capacite(30)
                .type(TypeSalleEnum.SALLE_INFORMATIQUE).accessiblePMR(false)
                .equipements(List.of("30 postes", "Projecteur"))
                .statut(StatutSalleEnum.DISPONIBLE).build());
        Salle aula = salleRepository.save(Salle.builder()
                .nom("Aula Magna").batiment("Principal").etage(0).capacite(500)
                .type(TypeSalleEnum.AULA).accessiblePMR(true)
                .equipements(List.of("Sonorisation pro", "Éclairage scénique", "Régie vidéo"))
                .statut(StatutSalleEnum.DISPONIBLE).build());
        Salle espaceExt = salleRepository.save(Salle.builder()
                .nom("Cour intérieure").batiment("Principal").etage(0).capacite(800)
                .type(TypeSalleEnum.ESPACE_EXTERIEUR).accessiblePMR(true)
                .equipements(List.of("Sonorisation extérieure"))
                .statut(StatutSalleEnum.MAINTENANCE).build());

        // ── 5. Clubs ────────────────────────────────────────────────────────
        Club clubRobotique = clubRepository.save(Club.builder()
                .nom("Club Robotique")
                .description("Conception et compétitions de robots")
                .categorie("TECH").logo("https://example.com/logo-robot.png")
                .president(presClub1).actif(true).build());
        Club clubIA = clubRepository.save(Club.builder()
                .nom("Club IA")
                .description("Veille et projets en intelligence artificielle")
                .categorie("TECH").logo("https://example.com/logo-ia.png")
                .president(presClub2).actif(true).build());
        Club clubCine = clubRepository.save(Club.builder()
                .nom("Club Cinéma")
                .description("Projections, débats et festivals étudiants")
                .categorie("CULTUREL").logo("https://example.com/logo-cine.png")
                .president(presClub3).actif(true).build());
        Club clubSport = clubRepository.save(Club.builder()
                .nom("Club Sport")
                .description("Tournois inter-filières et sorties sportives")
                .categorie("SPORTIF").president(presClub1).actif(true).build());

        // ── 6. Intervenants ─────────────────────────────────────────────────
        Intervenant interv1 = intervenantRepository.save(Intervenant.builder()
                .nom("Dr. Karim El Mansouri").institution("UM6P")
                .biographie("Chercheur en IA, plus de 30 publications.").build());
        Intervenant interv2 = intervenantRepository.save(Intervenant.builder()
                .nom("Pr. Amina Ziani").institution("EMI")
                .biographie("Spécialiste en cybersécurité et cryptographie.").build());
        Intervenant interv3 = intervenantRepository.save(Intervenant.builder()
                .nom("Mr. Sami Berrada").institution("INSEA")
                .biographie("Data Scientist, conférencier international.").build());
        Intervenant interv4 = intervenantRepository.save(Intervenant.builder()
                .nom("Dr. Leïla Ouazzani").institution("FST Tanger")
                .biographie("Expert robotique mobile et IoT.").build());

        // ── 7. Événements (différents statuts pour couvrir tous les cas) ────
        LocalDateTime now = LocalDateTime.now();

        Evenement evtApprouve = evenementRepository.save(Evenement.builder()
                .titre("Conférence IA 2026")
                .description("Une conférence sur les dernières avancées en intelligence artificielle.")
                .categorie(CategorieEnum.CONFERENCE)
                .dateDebut(now.plusDays(7))
                .dateFin(now.plusDays(7).plusHours(3))
                .capacite(150)
                .statut(StatutEvenementEnum.APPROUVE)
                .visibilite(VisibiliteEnum.UNIVERSITE)
                .type(TypeEvenementEnum.CLUB)
                .club(clubIA).organisateur(presClub2).build());

        Evenement evtSoumis = evenementRepository.save(Evenement.builder()
                .titre("Hackathon Robotique 48h")
                .description("Compétition de robotique sur 48 heures.")
                .categorie(CategorieEnum.COMPETITION)
                .dateDebut(now.plusDays(14))
                .dateFin(now.plusDays(16))
                .capacite(80)
                .statut(StatutEvenementEnum.SOUMIS)
                .visibilite(VisibiliteEnum.UNIVERSITE)
                .type(TypeEvenementEnum.CLUB)
                .club(clubRobotique).organisateur(presClub1).build());

        Evenement evtBrouillon = evenementRepository.save(Evenement.builder()
                .titre("Festival du film étudiant — édition 2026")
                .description("Projections, échanges avec réalisateurs.")
                .categorie(CategorieEnum.CULTUREL)
                .dateDebut(now.plusDays(30))
                .dateFin(now.plusDays(32))
                .capacite(300)
                .statut(StatutEvenementEnum.BROUILLON)
                .visibilite(VisibiliteEnum.INTERNE_CLUB)
                .type(TypeEvenementEnum.CLUB)
                .club(clubCine).organisateur(presClub3).build());

        Evenement evtTermine = evenementRepository.save(Evenement.builder()
                .titre("Atelier Python pour débutants")
                .description("Initiation à Python en 3 séances.")
                .categorie(CategorieEnum.ATELIER)
                .dateDebut(now.minusDays(10))
                .dateFin(now.minusDays(10).plusHours(4))
                .capacite(30)
                .statut(StatutEvenementEnum.TERMINE)
                .visibilite(VisibiliteEnum.UNIVERSITE)
                .type(TypeEvenementEnum.INSTITUTIONNEL)
                .organisateur(respEvts).build());

        Evenement evtInstit = evenementRepository.save(Evenement.builder()
                .titre("Cérémonie de remise des diplômes 2026")
                .description("Cérémonie officielle.")
                .categorie(CategorieEnum.AUTRE)
                .dateDebut(now.plusDays(45))
                .dateFin(now.plusDays(45).plusHours(4))
                .capacite(500)
                .statut(StatutEvenementEnum.APPROUVE)
                .visibilite(VisibiliteEnum.PUBLIC)
                .type(TypeEvenementEnum.INSTITUTIONNEL)
                .organisateur(respEvts).build());

        // ── 8. Liens événement ↔ intervenants ───────────────────────────────
        linkIntervenant(evtApprouve, interv1);
        linkIntervenant(evtApprouve, interv3);
        linkIntervenant(evtSoumis, interv4);
        linkIntervenant(evtTermine, interv3);

        // ── 9. Réservations (salle ↔ événement ↔ demandeur ↔ approbateur) ──
        Reservation resApprouvee = reservationRepository.save(Reservation.builder()
                .dateDebut(evtApprouve.getDateDebut())
                .dateFin(evtApprouve.getDateFin())
                .commentaire("Réservation pour la conférence IA")
                .statut(StatutReservationEnum.APPROUVEE)
                .salle(amphiA).evenement(evtApprouve)
                .demandeur(presClub2).approbateur(doyen).build());

        reservationRepository.save(Reservation.builder()
                .dateDebut(evtSoumis.getDateDebut())
                .dateFin(evtSoumis.getDateFin())
                .commentaire("Hackathon — besoin de salles avec PC")
                .statut(StatutReservationEnum.EN_ATTENTE)
                .salle(salleInfo).evenement(evtSoumis)
                .demandeur(presClub1).approbateur(doyen).build());

        Reservation resTerminee = reservationRepository.save(Reservation.builder()
                .dateDebut(evtTermine.getDateDebut())
                .dateFin(evtTermine.getDateFin())
                .commentaire("Atelier Python — séance unique")
                .statut(StatutReservationEnum.APPROUVEE)
                .salle(salleInfo).evenement(evtTermine)
                .demandeur(respEvts).approbateur(doyen).build());

        // ── 10. Inscriptions ────────────────────────────────────────────────
        saveInscription(etu1, evtApprouve, StatutInscriptionEnum.CONFIRMEE, false);
        saveInscription(etu2, evtApprouve, StatutInscriptionEnum.CONFIRMEE, false);
        saveInscription(etu3, evtApprouve, StatutInscriptionEnum.LISTE_ATTENTE, false);
        saveInscription(etu4, evtSoumis, StatutInscriptionEnum.CONFIRMEE, false);
        saveInscription(etu1, evtTermine, StatutInscriptionEnum.CONFIRMEE, true);
        saveInscription(etu5, evtTermine, StatutInscriptionEnum.CONFIRMEE, true);
        saveInscription(etu6, evtTermine, StatutInscriptionEnum.ANNULEE, false);

        // ── 11. Notifications ───────────────────────────────────────────────
        saveNotification("Inscription confirmée",
                "Votre inscription à 'Conférence IA 2026' est confirmée.",
                TypeNotifEnum.EMAIL, etu1, evtApprouve, true);
        saveNotification("Rappel événement",
                "L'atelier Python démarre dans 24h.",
                TypeNotifEnum.PUSH, etu1, evtTermine, true);
        saveNotification("Demande de réservation",
                "Une nouvelle demande de réservation attend votre approbation.",
                TypeNotifEnum.EMAIL, doyen, evtSoumis, false);

        // ── 12. Évaluations (uniquement sur l'événement TERMINE) ───────────
        evaluationRepository.save(Evaluation.builder()
                .note(5).commentaire("Très bon atelier, formateur clair.")
                .etudiant(etu1).reservation(resTerminee).build());
        evaluationRepository.save(Evaluation.builder()
                .note(4).commentaire("Bon contenu, un peu rapide sur la fin.")
                .etudiant(etu5).reservation(resTerminee).build());

        log.info("Seeder terminé : {} utilisateurs, {} étudiants, {} salles, {} clubs, " +
                        "{} intervenants, {} événements, {} inscriptions, {} réservations, " +
                        "{} notifications, {} évaluations.",
                utilisateurRepository.count(),
                etudiantRepository.count(),
                salleRepository.count(),
                clubRepository.count(),
                intervenantRepository.count(),
                evenementRepository.count(),
                inscriptionRepository.count(),
                reservationRepository.count(),
                notificationRepository.count(),
                evaluationRepository.count());

        log.info("Mot de passe par défaut pour tous les comptes : '{}'", DEFAULT_PASSWORD);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Utilisateur saveUser(String nom, String prenom, String email,
                                 String tel, RoleEnum role) {
        return utilisateurRepository.save(Utilisateur.builder()
                .nom(nom).prenom(prenom).email(email)
                .motDePasse(passwordEncoder.encode(DEFAULT_PASSWORD))
                .telephone(tel).role(role).actif(true).build());
    }

    private Etudiant saveEtudiant(String nom, String prenom, String email,
                                  String tel, String filiere, Integer annee, String cin) {
        return etudiantRepository.save(Etudiant.builder()
                .nom(nom).prenom(prenom).email(email)
                .motDePasse(passwordEncoder.encode(DEFAULT_PASSWORD))
                .telephone(tel).actif(true)
                .filiere(filiere).anneeEtude(annee).cin(cin).build());
    }

    private void linkIntervenant(Evenement evt, Intervenant interv) {
        evenementIntervenantRepository.save(EvenementIntervenant.builder()
                .id(new EvenementIntervenantId(evt.getId(), interv.getId()))
                .evenement(evt).intervenant(interv).build());
    }

    private void saveInscription(Etudiant etu, Evenement evt,
                                 StatutInscriptionEnum statut, boolean present) {
        inscriptionRepository.save(Inscription.builder()
                .dateInscription(LocalDateTime.now())
                .statut(statut)
                .qrCode("QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .present(present)
                .etudiant(etu).evenement(evt).build());
    }

    private void saveNotification(String titre, String message, TypeNotifEnum type,
                                  Utilisateur destinataire, Evenement evt, boolean lu) {
        notificationRepository.save(Notification.builder()
                .titre(titre).message(message).type(type)
                .destinataire(destinataire).evenement(evt).lu(lu).build());
    }
}
