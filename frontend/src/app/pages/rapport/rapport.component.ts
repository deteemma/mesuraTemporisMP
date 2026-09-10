import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rapport, RapportLigne } from '../../models/imputation';
import { RapportService } from '../../services/rapport.service';
import { formatSecondesHHMMSS } from '../../shared/duree.util';

export interface GroupeJour {
  journee: string;
  lignes: RapportLigne[];
  totalSecondes: number;
}

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rapport.component.html',
  styleUrl: './rapport.component.scss',
})
export class RapportComponent {
  dateDebut = '';
  dateFin = '';
  rapport: Rapport | null = null;

  formatSecondesHHMMSS = formatSecondesHHMMSS;

  constructor(private rapportService: RapportService) {}

  get groupesParJour(): GroupeJour[] {
    if (!this.rapport) return [];
    const lignesParJour = new Map<string, RapportLigne[]>();
    for (const ligne of this.rapport.lignes) {
      const lignes = lignesParJour.get(ligne.journee) ?? [];
      lignes.push(ligne);
      lignesParJour.set(ligne.journee, lignes);
    }
    return [...lignesParJour.entries()]
      .sort(([journeeA], [journeeB]) => journeeA.localeCompare(journeeB))
      .map(([journee, lignes]) => ({
        journee,
        lignes,
        totalSecondes: lignes.reduce((somme, ligne) => somme + ligne.dureeSecondes, 0),
      }));
  }

  genererRapport(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.rapportService.rapportPlage(this.dateDebut, this.dateFin).subscribe((rapport) => (this.rapport = rapport));
  }

  exporter(): void {
    if (!this.dateDebut || !this.dateFin) return;
    this.rapportService.exporterPlage(this.dateDebut, this.dateFin).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `rapport-${this.dateDebut}-${this.dateFin}.xlsx`;
      lien.click();
      URL.revokeObjectURL(url);
    });
  }
}
