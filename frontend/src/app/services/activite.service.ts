import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Activite } from '../models/activite';

@Injectable({ providedIn: 'root' })
export class ActiviteService {
  constructor(private http: HttpClient) {}

  lister(projetId: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${API_BASE_URL}/projets/${projetId}/activites`);
  }

  creer(projetId: string, nom: string): Observable<Activite> {
    return this.http.post<Activite>(`${API_BASE_URL}/projets/${projetId}/activites`, { nom });
  }

  renommer(projetId: string, activiteId: string, nom: string): Observable<Activite> {
    return this.http.patch<Activite>(`${API_BASE_URL}/projets/${projetId}/activites/${activiteId}`, { nom });
  }

  supprimer(projetId: string, activiteId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/projets/${projetId}/activites/${activiteId}`);
  }
}
