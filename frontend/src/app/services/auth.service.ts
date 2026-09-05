import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Utilisateur } from '../models/utilisateur';

const CLE_TOKEN = 'mesuretemporismp.token';
const CLE_UTILISATEUR = 'mesuretemporismp.utilisateur';

interface ReponseConnexion {
  token: string;
  utilisateur: Utilisateur;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  utilisateurCourant = signal<Utilisateur | null>(this.lireUtilisateurStocke());

  constructor(private http: HttpClient) {}

  private lireUtilisateurStocke(): Utilisateur | null {
    const brut = localStorage.getItem(CLE_UTILISATEUR);
    return brut ? JSON.parse(brut) : null;
  }

  obtenirToken(): string | null {
    return localStorage.getItem(CLE_TOKEN);
  }

  estConnecte(): boolean {
    return !!this.obtenirToken();
  }

  connecter(login: string, motDePasse: string): Observable<ReponseConnexion> {
    return this.http
      .post<ReponseConnexion>(`${API_BASE_URL}/auth/login`, { login, motDePasse })
      .pipe(tap((reponse) => this.stockerSession(reponse)));
  }

  changerMotDePasse(motDePasseActuel: string, nouveauMotDePasse: string): Observable<{ utilisateur: Utilisateur }> {
    return this.http
      .post<{ utilisateur: Utilisateur }>(`${API_BASE_URL}/auth/changer-mot-de-passe`, {
        motDePasseActuel,
        nouveauMotDePasse,
      })
      .pipe(
        tap((reponse) => {
          localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(reponse.utilisateur));
          this.utilisateurCourant.set(reponse.utilisateur);
        }),
      );
  }

  private stockerSession(reponse: ReponseConnexion): void {
    localStorage.setItem(CLE_TOKEN, reponse.token);
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(reponse.utilisateur));
    this.utilisateurCourant.set(reponse.utilisateur);
  }

  deconnecter(): void {
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_UTILISATEUR);
    this.utilisateurCourant.set(null);
  }
}
