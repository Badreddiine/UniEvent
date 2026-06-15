// ─── Enums (exact backend names) ────────────────────────────────────────────

export type CategorieEnum =
  | 'CONFERENCE'
  | 'ATELIER'
  | 'COMPETITION'
  | 'CULTUREL'
  | 'SPORTIF'
  | 'SORTIE'
  | 'AUTRE';

export type StatutEvenementEnum =
  | 'BROUILLON'
  | 'SOUMIS'
  | 'VERIFIE'
  | 'RESERVATION_EN_ATTENTE'
  | 'APPROUVE'
  | 'REJETE'
  | 'ANNULE'
  | 'TERMINE';

export type StatutInscriptionEnum = 'CONFIRMEE' | 'LISTE_ATTENTE' | 'ANNULEE';

export type StatutReservationEnum = 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'ANNULEE';

export type StatutSalleEnum = 'DISPONIBLE' | 'MAINTENANCE' | 'HORS_SERVICE';

export type TypeEvenementEnum = 'CLUB' | 'INSTITUTIONNEL';

export type TypeSalleEnum =
  | 'AMPHI'
  | 'SALLE_CONFERENCE'
  | 'SALLE_INFORMATIQUE'
  | 'ESPACE_EXTERIEUR'
  | 'AULA';

export type VisibiliteEnum = 'INTERNE_CLUB' | 'UNIVERSITE' | 'PUBLIC';

export type RoleEnum = 'ADMIN' | 'DOYEN' | 'RESPONSABLE_EVENEMENTS';

export type TypeNotifEnum = 'EMAIL' | 'PUSH' | 'SMS';

export type NotificationTypeEnum =
  | 'REGISTRATION_CONFIRMED'
  | 'EVENT_REMINDER'
  | 'EVENT_CANCELLED'
  | 'WAITLIST_PROMOTED'
  | 'BADGE_ISSUED';

export type TypePartenaireEnum =
  | 'ACADEMIQUE'
  | 'ENTREPRISE'
  | 'INSTITUTION'
  | 'ASSOCIATION'
  | 'MEDIA_PARTNER'
  | 'AUTRE';

export type NiveauSponsorEnum = 'PLATINE' | 'OR' | 'ARGENT' | 'BRONZE';

export type TypeRessourceEnum =
  | 'PROJECTEUR'
  | 'MICROPHONE'
  | 'ORDINATEUR'
  | 'CAMERA'
  | 'ECRAN'
  | 'TABLEAU'
  | 'SONORISATION'
  | 'AUTRE';

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

export interface LoginRequestDTO {
  email: string;
  motDePasse: string;
}

export interface RegisterRequestDTO {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// ─── User DTOs ───────────────────────────────────────────────────────────────

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  telephone?: string;
  role?: RoleEnum;
  actif: boolean;
  presidentDeClub?: boolean;
  dateCreation: string;
}

export interface UpdateMeDTO {
  nom?: string;
  prenom?: string;
  photo?: string;
  telephone?: string;
}

export interface RoleUpdateDTO {
  role: RoleEnum;
}

export interface UtilisateurCreateDTO {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  photo?: string;
  telephone?: string;
  role?: RoleEnum;
}

export interface UtilisateurResponseDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  telephone?: string;
  role?: RoleEnum;
  actif: boolean;
  dateCreation: string;
}

// ─── Event DTOs ──────────────────────────────────────────────────────────────

export interface EventDTO {
  id: number;
  titre: string;
  description?: string;
  categorie?: CategorieEnum;
  dateDebut?: string;
  dateFin?: string;
  capacite?: number;
  registrationCount: number;
  affiche?: string;
  statut?: StatutEvenementEnum;
  visibilite?: VisibiliteEnum;
  type?: TypeEvenementEnum;
  lienVisio?: string;
  organisateurId?: number;
  organisateurNom?: string;
  clubId?: number;
  clubNom?: string;
}

export interface CreateEventRequest {
  titre: string;
  description?: string;
  categorie: CategorieEnum;
  dateDebut: string;
  dateFin: string;
  capacite?: number;
  affiche?: string;
  visibilite?: VisibiliteEnum;
  type?: TypeEvenementEnum;
  lienVisio?: string;
  clubId?: number;
}

export interface EvenementResponseDTO {
  id: number;
  titre: string;
  description?: string;
  categorie?: CategorieEnum;
  dateDebut?: string;
  dateFin?: string;
  capacite?: number;
  affiche?: string;
  statut?: StatutEvenementEnum;
  visibilite?: VisibiliteEnum;
  type?: TypeEvenementEnum;
  lienVisio?: string;
  clubId?: number;
  clubName?: string;
  organisateurId?: number;
  organisateurName?: string;
}

// ─── Registration DTOs ───────────────────────────────────────────────────────

export interface RegistrationDTO {
  id: number;
  evenementId: number;
  evenementTitre?: string;
  etudiantId: number;
  etudiantNom?: string;
  statut: StatutInscriptionEnum;
  dateInscription: string;
  qrCode?: string;
  present: boolean;
}

export interface InscriptionResponseDTO {
  id: number;
  dateInscription?: string;
  statut?: StatutInscriptionEnum;
  qrCode?: string;
  present?: boolean;
  etudiantId?: number;
  etudiantName?: string;
  evenementId?: number;
  evenementTitle?: string;
}

// ─── Reservation DTOs ────────────────────────────────────────────────────────

export interface CreateReservationRequest {
  salleId: number;
  evenementId: number;
  dateDebut: string;
  dateFin: string;
  commentaire?: string;
}

export interface ReservationResponseDTO {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: StatutReservationEnum;
  commentaire?: string;
  dateCreation: string;
  evenementId?: number;
  evenementTitre?: string;
  salleId?: number;
  salleNom?: string;
  demandeurId?: number;
  demandeurNom?: string;
  demandeurPrenom?: string;
  approbateurId?: number;
  approbateurNom?: string;
}

// ─── Room DTOs ───────────────────────────────────────────────────────────────

export interface RoomDTO {
  id: number;
  nom: string;
  batiment?: string;
  etage?: number;
  capacite?: number;
  type?: TypeSalleEnum;
  equipements?: string[];
  accessiblePMR?: boolean;
  statut?: StatutSalleEnum;
  photos?: string[];
}

// ─── Notification DTOs ───────────────────────────────────────────────────────

export interface NotificationResponseDTO {
  id: number;
  titre: string;
  message: string;
  type: TypeNotifEnum;
  lu: boolean;
  dateEnvoi: string;
  destinataireId?: number;
  destinataireNom?: string;
  destinatairePrenom?: string;
  evenementId?: number;
  evenementTitre?: string;
}

// ─── Badge DTOs ──────────────────────────────────────────────────────────────

export interface BadgeDto {
  token: string;
  templateNom?: string;
  evenementId?: number;
  evenementTitre?: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  inscriptionId?: number;
  genereLe?: string;
  qrImage?: string;
}

// ─── Partner & Sponsor DTOs ──────────────────────────────────────────────────

export interface PartnerDto {
  id: string;
  nom: string;
  description?: string;
  logoUrl?: string;
  siteWeb?: string;
  emailContact?: string;
  nomContact?: string;
  type?: TypePartenaireEnum;
  actif: boolean;
  createdAt?: string;
}

export interface CreatePartnerRequest {
  nom: string;
  description?: string;
  logoUrl?: string;
  siteWeb?: string;
  emailContact?: string;
  nomContact?: string;
  type?: TypePartenaireEnum;
}

export interface EventSponsorDto {
  id: string;
  partenaire?: PartnerDto;
  niveau?: NiveauSponsorEnum;
  montant?: number;
  confirme: boolean;
  displayOrder?: number;
}

export interface CreateSponsorRequest {
  partenaireId: string;
  niveau: NiveauSponsorEnum;
  montant?: number;
  displayOrder?: number;
}

// ─── Analytics DTOs ──────────────────────────────────────────────────────────

export interface OverviewDto {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  occupancyRate: number;
}

export interface DailyCountDto {
  date: string;
  count: number;
}

export interface RoomUtilizationDto {
  roomId: number;
  roomName: string;
  totalReservations: number;
  approvedHours: number;
  totalRequestedHours: number;
  utilizationPercent: number;
}

export interface EventAnalyticsDto {
  eventId: number;
  eventTitle: string;
  capacite?: number;
  confirmedRegistrations: number;
  waitlistSize: number;
  cancelledRegistrations: number;
  attendanceRate?: number;
  registrationsOverTime: DailyCountDto[];
  roomUtilization: RoomUtilizationDto[];
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
