export interface Imputation {
  id: string;
  utilisateurId: string;
  projetId: string;
  activiteId: string;
  heureDebut: string;
  heureFin: string | null;
}

/**
 * Réponse de `PATCH /imputations/:id`. Porte, en plus de l'Imputation d'origine
 * (éventuellement tronquée), la nouvelle Imputation créée par une Scission
 * automatique à minuit (voir ADR 0003), ou `null` si aucune Scission n'a eu lieu.
 */
export interface ImputationModifiee extends Imputation {
  scission: Imputation | null;
}

/**
 * Réponse de `POST /imputations/chrono/start`. Porte, en plus de la nouvelle
 * Imputation démarrée, les informations de l'Imputation précédemment active si son
 * chronomètre a été arrêté automatiquement (voir CONTEXT.md, entrée « Imputation »),
 * ou `null` si aucun chrono n'était actif.
 */
export interface ImputationDemarree extends Imputation {
  chronoPrecedentArrete: Imputation | null;
}

export interface SyntheseJournaliereLigne {
  projetId: string;
  projetNom: string;
  activiteId: string;
  activiteNom: string;
  dureeSecondes: number;
}

export interface SyntheseJournaliere {
  date: string;
  lignes: SyntheseJournaliereLigne[];
  totalSecondes: number;
}

export interface RapportLigne {
  utilisateurId: string;
  utilisateurLogin: string;
  projetId: string;
  projetNom: string;
  activiteId: string;
  activiteNom: string;
  journee: string;
  dureeSecondes: number;
}

export interface Rapport {
  dateDebut: string;
  dateFin: string;
  lignes: RapportLigne[];
  totalSecondes: number;
}
