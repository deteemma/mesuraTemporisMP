import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Imputation } from '../models/imputation';

@Injectable({ providedIn: 'root' })
export class ImputationService {
  constructor(private http: HttpClient) {}

  statutChrono(): Observable<Imputation | null> {
    return this.http.get<Imputation | null>(`${API_BASE_URL}/imputations/chrono/status`);
  }

  demarrerChrono(
    projetId: string,
    options: { activiteId?: string; nomNouvelleActivite?: string },
  ): Observable<Imputation> {
    return this.http.post<Imputation>(`${API_BASE_URL}/imputations/chrono/start`, { projetId, ...options });
  }

  arreterChrono(): Observable<Imputation> {
    return this.http.post<Imputation>(`${API_BASE_URL}/imputations/chrono/stop`, {});
  }

  creerManuelle(
    projetId: string,
    activiteId: string,
    heureDebut: string,
    heureFin: string,
  ): Observable<Imputation> {
    return this.http.post<Imputation>(`${API_BASE_URL}/imputations`, {
      projetId,
      activiteId,
      heureDebut,
      heureFin,
    });
  }

  listerDuJour(date: string): Observable<Imputation[]> {
    return this.http.get<Imputation[]>(`${API_BASE_URL}/imputations`, { params: { date } });
  }

  modifier(id: string, changements: { heureDebut?: string; heureFin?: string }): Observable<Imputation> {
    return this.http.patch<Imputation>(`${API_BASE_URL}/imputations/${id}`, changements);
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/imputations/${id}`);
  }
}
