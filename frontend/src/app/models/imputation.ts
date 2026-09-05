export interface Imputation {
  id: string;
  utilisateurId: string;
  projetId: string;
  activiteId: string;
  heureDebut: string;
  heureFin: string | null;
}

export interface SyntheseJournaliereLigne {
  projetId: string;
  projetNom: string;
  activiteId: string;
  activiteNom: string;
  dureeMinutes: number;
}

export interface SyntheseJournaliere {
  date: string;
  lignes: SyntheseJournaliereLigne[];
  totalMinutes: number;
}

export interface RapportLigne {
  utilisateurId: string;
  utilisateurLogin: string;
  projetId: string;
  projetNom: string;
  activiteId: string;
  activiteNom: string;
  journee: string;
  dureeMinutes: number;
}

export interface Rapport {
  dateDebut: string;
  dateFin: string;
  lignes: RapportLigne[];
  totalMinutes: number;
}
