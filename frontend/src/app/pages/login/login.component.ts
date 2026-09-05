import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  login = '';
  motDePasse = '';
  messageErreur = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  seConnecter(): void {
    this.messageErreur = '';
    this.authService.connecter(this.login, this.motDePasse).subscribe({
      next: (reponse) => {
        if (reponse.utilisateur.doitChangerMotDePasse) {
          this.router.navigateByUrl('/changer-mot-de-passe');
        } else {
          this.router.navigateByUrl('/saisie-temps');
        }
      },
      error: () => {
        this.messageErreur = 'Identifiants invalides';
      },
    });
  }
}
