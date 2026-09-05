import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Activite } from '../../models/activite';
import { ActiviteService } from '../../services/activite.service';

@Component({
  selector: 'app-activites',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './activites.component.html',
})
export class ActivitesComponent implements OnInit {
  projetId = '';
  activites: Activite[] = [];
  nouveauNomActivite = '';
  renommageEnCours: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private activiteService: ActiviteService,
  ) {}

  ngOnInit(): void {
    this.projetId = this.route.snapshot.paramMap.get('projetId') ?? '';
    this.rafraichir();
  }

  rafraichir(): void {
    this.activiteService.lister(this.projetId).subscribe((activites) => (this.activites = activites));
  }

  creer(): void {
    if (!this.nouveauNomActivite) return;
    this.activiteService.creer(this.projetId, this.nouveauNomActivite).subscribe(() => {
      this.nouveauNomActivite = '';
      this.rafraichir();
    });
  }

  renommer(activiteId: string): void {
    const nom = this.renommageEnCours[activiteId];
    if (!nom) return;
    this.activiteService.renommer(this.projetId, activiteId, nom).subscribe(() => this.rafraichir());
  }

  supprimer(activiteId: string): void {
    this.activiteService.supprimer(this.projetId, activiteId).subscribe(() => this.rafraichir());
  }
}
