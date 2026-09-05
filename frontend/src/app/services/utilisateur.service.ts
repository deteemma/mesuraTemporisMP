import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Utilisateur } from '../models/utilisateur';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  constructor(private http: HttpClient) {}

  lister(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${API_BASE_URL}/utilisateurs`);
  }

  creer(login: string, nom: string): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${API_BASE_URL}/utilisateurs`, { login, nom });
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/utilisateurs/${id}`);
  }
}
