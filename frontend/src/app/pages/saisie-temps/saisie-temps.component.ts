import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Activite } from '../../models/activite';
import { Imputation, SyntheseJournaliere } from '../../models/imputation';
import { Projet } from '../../models/projet';
import { ActiviteService } from '../../services/activite.service';
import { ImputationService } from '../../services/imputation.service';
import { ProjetService } from '../../services/projet.service';
import { RapportService } from '../../services/rapport.service';
import { formatDuree, formatHeure, formatMinutes } from './imputation-format.util';

function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-saisie-temps',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './saisie-temps.component.html',
  styleUrl: './saisie-temps.component.scss',
})
export class SaisieTempsComponent implements OnInit {
  projets: Projet[] = [];
  activites: Activite[] = [];
  chronoActif: Imputation | null = null;
  synthese: SyntheseJournaliere | null = null;
  imputationsDuJour: Imputation[] = [];

  projetChoisi = '';
  activiteChoisie = '';
  nomNouvelleActivite = '';

  projetSaisieManuelle = '';
  activiteSaisieManuelle = '';
  heureDebutManuelle = '';
  heureFinManuelle = '';

  formatHeure = formatHeure;
  formatDuree = formatDuree;
  formatMinutes = formatMinutes;

  private capNomsActivites: Record<string, string> = {};

  constructor(
    private projetService: ProjetService,
    private activiteService: ActiviteService,
    private imputationService: ImputationService,
    private rapportService: RapportService,
  ) {}

  ngOnInit(): void {
    this.projetService.lister().subscribe((projets) => (this.projets = projets));
    this.rafraichirChrono();
    this.rafraichirSynthese();
    this.rafraichirImputationsDuJour();
  }

  nomProjet(id: string): string {
    return this.projets.find((p) => p.id === id)?.nom ?? '—';
  }

  nomActivite(id: string): string {
    return this.capNomsActivites[id] ?? '—';
  }

  private rafraichirChrono(): void {
    this.imputationService.statutChrono().subscribe((imputation) => (this.chronoActif = imputation));
  }

  private rafraichirSynthese(): void {
    this.rapportService.syntheseJournaliere(dateDuJour()).subscribe((synthese) => (this.synthese = synthese));
  }

  private rafraichirImputationsDuJour(): void {
    this.imputationService.listerDuJour(dateDuJour()).subscribe((imputations) => {
      this.imputationsDuJour = imputations;
      this.completerCacheNomsActivites(imputations);
    });
  }

  private completerCacheNomsActivites(imputations: Imputation[]): void {
    const projetIds = [...new Set(imputations.map((i) => i.projetId))];
    for (const projetId of projetIds) {
      this.activiteService.lister(projetId).subscribe((activites) => {
        for (const activite of activites) {
          this.capNomsActivites[activite.id] = activite.nom;
        }
      });
    }
  }

  private rafraichirApresChangement(): void {
    this.rafraichirChrono();
    this.rafraichirSynthese();
    this.rafraichirImputationsDuJour();
  }

  chargerActivites(projetId: string): void {
    if (!projetId) {
      this.activites = [];
      return;
    }
    this.activiteService.lister(projetId).subscribe((activites) => (this.activites = activites));
  }

  demarrerChrono(): void {
    if (!this.projetChoisi || this.chronoActif) return;
    const options = this.nomNouvelleActivite
      ? { nomNouvelleActivite: this.nomNouvelleActivite }
      : { activiteId: this.activiteChoisie };

    this.imputationService.demarrerChrono(this.projetChoisi, options).subscribe(() => {
      this.nomNouvelleActivite = '';
      this.activiteChoisie = '';
      this.rafraichirApresChangement();
    });
  }

  arreterChrono(): void {
    this.imputationService.arreterChrono().subscribe(() => this.rafraichirApresChangement());
  }

  ajouterImputationManuelle(): void {
    if (!this.projetSaisieManuelle || !this.activiteSaisieManuelle || !this.heureDebutManuelle || !this.heureFinManuelle) {
      return;
    }
    this.imputationService
      .creerManuelle(
        this.projetSaisieManuelle,
        this.activiteSaisieManuelle,
        new Date(this.heureDebutManuelle).toISOString(),
        new Date(this.heureFinManuelle).toISOString(),
      )
      .subscribe(() => {
        this.heureDebutManuelle = '';
        this.heureFinManuelle = '';
        this.rafraichirApresChangement();
      });
  }

  supprimerImputation(id: string): void {
    this.imputationService.supprimer(id).subscribe(() => this.rafraichirApresChangement());
  }
}
