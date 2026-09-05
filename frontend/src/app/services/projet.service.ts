import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Projet } from '../models/projet';

@Injectable({ providedIn: 'root' })
export class ProjetService {
  constructor(private http: HttpClient) {}

  lister(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${API_BASE_URL}/projets`);
  }

  obtenir(id: string): Observable<Projet> {
    return this.http.get<Projet>(`${API_BASE_URL}/projets/${id}`);
  }

  creer(nom: string): Observable<Projet> {
    return this.http.post<Projet>(`${API_BASE_URL}/projets`, { nom });
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/projets/${id}`);
  }

  affecterUtilisateur(projetId: string, utilisateurId: string): Observable<Projet> {
    return this.http.post<Projet>(`${API_BASE_URL}/projets/${projetId}/utilisateurs`, { utilisateurId });
  }

  retirerUtilisateur(projetId: string, utilisateurId: string): Observable<Projet> {
    return this.http.delete<Projet>(`${API_BASE_URL}/projets/${projetId}/utilisateurs/${utilisateurId}`);
  }
}
