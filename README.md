# UniEvent — Plateforme de Gestion des Événements Universitaires

> FST Settat · Next.js 15 · TypeScript · Tailwind CSS · Zustand

---

## 🚀 Installation & Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.local.example .env.local

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## 📁 Structure du Projet

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil (redirect)
│   ├── auth/                     # Pages d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── dashboard/                # Espace utilisateur connecté
│   │   ├── page.tsx              # Tableau de bord
│   │   ├── events/               # Catalogue & gestion événements
│   │   │   ├── page.tsx          # Catalogue public
│   │   │   ├── calendar/         # Vue calendrier
│   │   │   ├── create/           # Créer un événement
│   │   │   ├── mine/             # Mes événements
│   │   │   └── edit/[id]/        # Modifier un événement
│   │   ├── reservations/         # Demandes de réservation
│   │   │   └── approval/         # File d'approbation (Doyen)
│   │   ├── rooms/                # Salles disponibles
│   │   ├── analytics/            # Tableaux analytiques
│   │   ├── my-agenda/            # Agenda étudiant
│   │   ├── registrations/        # Inscriptions étudiant
│   │   ├── profile/              # Profil utilisateur
│   │   ├── settings/             # Paramètres
│   │   └── notifications/        # Notifications
│   ├── events/                   # Catalogue public (sans auth)
│   │   ├── page.tsx
│   │   ├── [id]/                 # Détail événement
│   │   └── book/[id]/            # Inscription événement
│   └── admin/                    # Console d'administration
│       ├── page.tsx              # Dashboard admin
│       ├── users/                # Gestion utilisateurs
│       ├── clubs/                # Gestion clubs
│       ├── rooms/                # Gestion salles
│       └── settings/             # Paramètres système
│
├── components/
│   ├── layout/                   # Navbar, Sidebar, Mobile overlay
│   ├── shared/                   # StatCard, PageHeader, EmptyState
│   ├── ui/                       # Composants de base (Button, Input…)
│   ├── auth/                     # Formulaires d'authentification
│   ├── dashboard/                # Composants dashboard utilisateur
│   ├── events/                   # Catalogue, EventCard, EventDetail, Booking
│   ├── events-crud/              # Formulaires Create/Edit/Delete
│   └── admin/                    # Dashboard admin, Users, Clubs
│
├── lib/
│   ├── utils.ts                  # Utilitaires (cn, formatDate, etc.)
│   ├── constants.ts              # NAV_ITEMS, constantes app
│   ├── fake-data.ts              # Données simulées dashboard
│   ├── public-events-data.ts     # Données événements publics
│   ├── events-crud-data.ts       # Données CRUD événements
│   ├── admin-fake-data.ts        # Données admin dashboard
│   ├── admin-users-data.ts       # Données utilisateurs admin
│   ├── admin-constants.ts        # Navigation admin
│   └── validations/auth.ts       # Schémas Zod authentification
│
├── store/
│   ├── auth.store.ts             # Store Zustand authentification
│   └── ui.store.ts               # Store Zustand UI (sidebar, etc.)
│
├── hooks/
│   └── use-auth-form.ts          # Hook formulaire auth
│
├── types/
│   └── index.ts                  # Types TypeScript globaux
│
└── styles/
    └── globals.css               # Variables CSS + Tailwind
```

---

## 👥 Rôles Utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| `admin` | Super Admin | Toutes les fonctionnalités + `/admin/*` |
| `doyen` | Doyen / Direction | Approbation réservations, analytics |
| `responsable_evenements` | Resp. Événements | Création événements institutionnels |
| `president_club` | Président de Club | Création/gestion événements club |
| `etudiant` | Étudiant | Consultation, inscription, agenda |

---

## 🗺️ Routes principales

### Authentification
- `/auth/login` — Connexion
- `/auth/register` — Inscription
- `/auth/forgot-password` — Mot de passe oublié
- `/auth/verify-email` — Vérification email

### Dashboard Utilisateur
- `/dashboard` — Tableau de bord personnalisé
- `/dashboard/events` — Catalogue événements
- `/dashboard/events/calendar` — Vue calendrier
- `/dashboard/events/create` — Créer un événement *(President club, Resp. Evt, Admin)*
- `/dashboard/events/mine` — Mes événements
- `/dashboard/reservations` — Mes demandes de réservation
- `/dashboard/reservations/approval` — File d'approbation *(Doyen, Admin)*
- `/dashboard/rooms` — Salles disponibles
- `/dashboard/analytics` — Analytique *(Doyen, Resp. Evt, Admin)*
- `/dashboard/my-agenda` — Mon agenda *(Étudiant)*
- `/dashboard/registrations` — Mes inscriptions *(Étudiant)*

### Public
- `/events` — Catalogue public
- `/events/[id]` — Détail événement
- `/events/book/[id]` — Inscription à un événement

### Administration
- `/admin` — Dashboard admin
- `/admin/users` — Gestion utilisateurs
- `/admin/clubs` — Gestion clubs
- `/admin/rooms` — Gestion salles
- `/admin/settings` — Paramètres système

---

## 🛠️ Technologies

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Style** : Tailwind CSS + CSS Variables
- **État** : Zustand 5 (avec persist)
- **Animations** : Framer Motion
- **Charts** : Recharts
- **Icons** : Lucide React
- **Validation** : Zod
- **Radix UI** : Dialog, DropdownMenu, Avatar, Separator, Toast, etc.

---

## 📝 Notes de développement

- Toutes les données sont **simulées** (fake data). En production, remplacer par des appels API réels.
- L'authentification est simulée côté frontend. En production, connecter à un backend (FastAPI, NestJS, etc.).
- Le projet est configuré pour **Next.js 15** avec App Router et React 19.
- Les tokens de design sont définis dans `src/styles/globals.css` via des variables CSS HSL.

---

## 🏗️ Phases de développement

| Phase | Contenu | Statut |
|-------|---------|--------|
| Phase 1 | Structure, layout, sidebar, navbar, stores | ✅ |
| Phase 2 | Authentification (login, register, forgot, verify) | ✅ |
| Phase 3 | Dashboard utilisateur (accueil, profil, settings, notifs) | ✅ |
| Phase 4A | Console Admin (layout, dashboard) | ✅ |
| Phase 4B | Admin — Gestion utilisateurs | ✅ |
| Phase 5A | Catalogue public des événements | ✅ |
| Phase 5B1 | Formulaire d'inscription (BookingModal) | ✅ |
| Phase 5B2 | CRUD événements (créer, modifier, supprimer) | ✅ |
| Finalisation | Pages manquantes, config, assemblage | ✅ |
