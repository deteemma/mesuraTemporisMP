import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Projet } from '../../models/projet';
import { Utilisateur } from '../../models/utilisateur';
import { AuthService } from '../../services/auth.service';
import { ProjetService } from '../../services/projet.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './projets.component.html',
  styleUrl: './projets.component.scss',
})
export class ProjetsComponent implements OnInit {
  projets: Projet[] = [];
  utilisateurs: Utilisateur[] = [];
  nouveauNomProjet = '';
  affectationChoisie: Record<string, string> = {};

  constructor(
    public authService: AuthService,
    private projetService: ProjetService,
    private utilisateurService: UtilisateurService,
  ) {}

  ngOnInit(): void {
    this.rafraichir();
    if (this.authService.utilisateurCourant()?.role === 'administrateur') {
      this.utilisateurService.lister().subscribe((utilisateurs) => (this.utilisateurs = utilisateurs));
    }
  }

  rafraichir(): void {
    this.projetService.lister().subscribe((projets) => (this.projets = projets));
  }

  creer(): void {
    if (!this.nouveauNomProjet) return;
    this.projetService.creer(this.nouveauNomProjet).subscribe(() => {
      this.nouveauNomProjet = '';
      this.rafraichir();
    });
  }

  supprimer(id: string): void {
    this.projetService.supprimer(id).subscribe(() => this.rafraichir());
  }

  affecter(projetId: string): void {
    const utilisateurId = this.affectationChoisie[projetId];
    if (!utilisateurId) return;
    this.projetService.affecterUtilisateur(projetId, utilisateurId).subscribe(() => this.rafraichir());
  }

  retirer(projetId: string, utilisateurId: string): void {
    this.projetService.retirerUtilisateur(projetId, utilisateurId).subscribe(() => this.rafraichir());
  }

  nomUtilisateur(id: string): string {
    return this.utilisateurs.find((u) => u.id === id)?.login ?? id;
  }
}
