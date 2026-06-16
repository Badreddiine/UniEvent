-- Flux de vérification d'email à l'inscription.
-- email_verified            : passe à TRUE une fois l'email confirmé.
-- verification_token        : jeton UUID envoyé par email (NULL une fois consommé).
-- verification_token_expiry : date d'expiration du jeton (NOW + 24h à la création).

ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;
