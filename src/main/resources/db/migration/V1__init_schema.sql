-- utilisateur table
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    photo VARCHAR(255),
    telephone VARCHAR(255),
    role VARCHAR(50),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- etudiant (JOINED inheritance subtype)
CREATE TABLE IF NOT EXISTS etudiant (
    id_utilisateur BIGINT PRIMARY KEY REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    filiere VARCHAR(255),
    annee_etude INTEGER,
    cin VARCHAR(255)
);

-- club
CREATE TABLE IF NOT EXISTS club (
    id_club BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(255),
    logo VARCHAR(255),
    date_creation DATE DEFAULT CURRENT_DATE,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    id_president BIGINT REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL
);

-- intervenant
CREATE TABLE IF NOT EXISTS intervenant (
    id_intervenant BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    biographie TEXT
);

-- evenement
CREATE TABLE IF NOT EXISTS evenement (
    id BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255),
    description TEXT,
    categorie VARCHAR(50),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    capacite INTEGER,
    affiche VARCHAR(255),
    statut VARCHAR(50),
    visibilite VARCHAR(50),
    type VARCHAR(50),
    lien_visio VARCHAR(255),
    id_club BIGINT REFERENCES club(id_club) ON DELETE SET NULL,
    id_organisateur BIGINT REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL
);

-- evenement_intervenant (composite PK join table)
CREATE TABLE IF NOT EXISTS evenement_intervenant (
    id_evenement BIGINT NOT NULL REFERENCES evenement(id) ON DELETE CASCADE,
    id_intervenant BIGINT NOT NULL REFERENCES intervenant(id_intervenant) ON DELETE CASCADE,
    PRIMARY KEY (id_evenement, id_intervenant)
);

-- salle
CREATE TABLE IF NOT EXISTS salle (
    id_salle BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    batiment VARCHAR(255),
    etage INTEGER,
    capacite INTEGER,
    type VARCHAR(50),
    accessible_pmr BOOLEAN DEFAULT FALSE,
    statut VARCHAR(50) NOT NULL DEFAULT 'DISPONIBLE'
);

-- salle_equipements (element collection)
CREATE TABLE IF NOT EXISTS salle_equipements (
    id_salle BIGINT NOT NULL REFERENCES salle(id_salle) ON DELETE CASCADE,
    equipement VARCHAR(255)
);

-- salle_photos (element collection)
CREATE TABLE IF NOT EXISTS salle_photos (
    id_salle BIGINT NOT NULL REFERENCES salle(id_salle) ON DELETE CASCADE,
    photo VARCHAR(255)
);

-- inscription
CREATE TABLE IF NOT EXISTS inscription (
    id BIGSERIAL PRIMARY KEY,
    date_inscription TIMESTAMP,
    statut VARCHAR(50),
    qr_code VARCHAR(255),
    present BOOLEAN,
    id_etudiant BIGINT REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL,
    id_evenement BIGINT REFERENCES evenement(id) ON DELETE CASCADE
);

-- reservation
CREATE TABLE IF NOT EXISTS reservation (
    id_reservation BIGSERIAL PRIMARY KEY,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_salle BIGINT NOT NULL REFERENCES salle(id_salle),
    id_evenement BIGINT NOT NULL REFERENCES evenement(id),
    id_demandeur BIGINT NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_approbateur BIGINT REFERENCES utilisateur(id_utilisateur)
);

-- notification
CREATE TABLE IF NOT EXISTS notification (
    id_notification BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_destinataire BIGINT NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    id_evenement BIGINT REFERENCES evenement(id) ON DELETE SET NULL
);

-- evaluation
CREATE TABLE IF NOT EXISTS evaluation (
    id_evaluation BIGSERIAL PRIMARY KEY,
    note INTEGER NOT NULL,
    commentaire TEXT,
    date_evaluation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_etudiant BIGINT NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_reservation BIGINT NOT NULL REFERENCES reservation(id_reservation)
);

-- ressource (new, UUID PK)
CREATE TABLE IF NOT EXISTS ressource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    quantite INTEGER NOT NULL DEFAULT 1,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    id_salle BIGINT REFERENCES salle(id_salle) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- partenaire (new, UUID PK)
CREATE TABLE IF NOT EXISTS partenaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    site_web VARCHAR(500),
    email_contact VARCHAR(255),
    nom_contact VARCHAR(255),
    type VARCHAR(50),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- sponsor (new, UUID PK)
CREATE TABLE IF NOT EXISTS sponsor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niveau VARCHAR(50),
    montant NUMERIC(15,2),
    confirme BOOLEAN NOT NULL DEFAULT FALSE,
    id_partenaire UUID NOT NULL REFERENCES partenaire(id) ON DELETE CASCADE,
    id_evenement BIGINT NOT NULL REFERENCES evenement(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_partenaire, id_evenement)
);

-- badge (new, UUID PK)
CREATE TABLE IF NOT EXISTS badge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_nom VARCHAR(255),
    qr_data TEXT,
    genere_le TIMESTAMP,
    id_inscription BIGINT UNIQUE REFERENCES inscription(id) ON DELETE SET NULL,
    id_evenement BIGINT REFERENCES evenement(id) ON DELETE SET NULL,
    id_utilisateur BIGINT REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- refresh_token (new, UUID PK)
CREATE TABLE IF NOT EXISTS refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(512) NOT NULL UNIQUE,
    id_utilisateur BIGINT NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_utilisateur ON refresh_token(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_evenement_statut ON evenement(statut);
CREATE INDEX IF NOT EXISTS idx_inscription_evenement ON inscription(id_evenement);
CREATE INDEX IF NOT EXISTS idx_notification_destinataire ON notification(id_destinataire);
