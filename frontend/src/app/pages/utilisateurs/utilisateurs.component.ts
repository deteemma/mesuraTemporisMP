import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../../models/utilisateur';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss',
})
export class UtilisateursComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  nouveauLogin = '';
  nouveauNom = '';

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.rafraichir();
  }

  rafraichir(): void {
    this.utilisateurService.lister().subscribe((utilisateurs) => (this.utilisateurs = utilisateurs));
  }

  creer(): void {
    if (!this.nouveauLogin) return;
    this.utilisateurService.creer(this.nouveauLogin, this.nouveauNom).subscribe(() => {
      this.nouveauLogin = '';
      this.nouveauNom = '';
      this.rafraichir();
    });
  }

  supprimer(id: string): void {
    this.utilisateurService.supprimer(id).subscribe(() => this.rafraichir());
  }
}
