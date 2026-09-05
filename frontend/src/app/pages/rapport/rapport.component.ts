import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rapport } from '../../models/imputation';
import { RapportService } from '../../services/rapport.service';

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rapport.component.html',
})
export class RapportComponent {
  dateDebut = '';
  dateFin = '';
  rapport: Rapport | null = null;

  constructor(private rapportService: RapportService) {}

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
