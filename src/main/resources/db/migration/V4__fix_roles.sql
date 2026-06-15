-- V4 — Homogénéise les rôles existants après l'ajout de ETUDIANT au RoleEnum.
-- Les comptes créés avant avaient role = NULL pour les étudiants.

-- 1. Les utilisateurs ayant une ligne dans `etudiant` deviennent explicitement ETUDIANT.
UPDATE utilisateur SET role = 'ETUDIANT'
WHERE role IS NULL AND email IN (
  SELECT u.email FROM utilisateur u
  LEFT JOIN etudiant e ON e.id_utilisateur = u.id_utilisateur
  WHERE e.id_utilisateur IS NOT NULL
);

-- 2. Tout rôle encore NULL bascule par défaut sur ETUDIANT.
UPDATE utilisateur SET role = 'ETUDIANT'
WHERE role IS NULL;
