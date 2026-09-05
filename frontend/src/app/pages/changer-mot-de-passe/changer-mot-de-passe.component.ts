import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-changer-mot-de-passe',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './changer-mot-de-passe.component.html',
})
export class ChangerMotDePasseComponent {
  motDePasseActuel = '';
  nouveauMotDePasse = '';
  messageErreur = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  valider(): void {
    this.messageErreur = '';
    this.authService.changerMotDePasse(this.motDePasseActuel, this.nouveauMotDePasse).subscribe({
      next: () => this.router.navigateByUrl('/saisie-temps'),
      error: () => {
        this.messageErreur = 'Mot de passe actuel incorrect';
      },
    });
  }
}
