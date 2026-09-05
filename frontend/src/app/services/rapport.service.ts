import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { Rapport, SyntheseJournaliere } from '../models/imputation';

@Injectable({ providedIn: 'root' })
export class RapportService {
  constructor(private http: HttpClient) {}

  syntheseJournaliere(date: string): Observable<SyntheseJournaliere> {
    return this.http.get<SyntheseJournaliere>(`${API_BASE_URL}/rapports/journalier`, { params: { date } });
  }

  rapportPlage(dateDebut: string, dateFin: string): Observable<Rapport> {
    return this.http.get<Rapport>(`${API_BASE_URL}/rapports/plage`, { params: { dateDebut, dateFin } });
  }

  exporterPlage(dateDebut: string, dateFin: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/rapports/plage/export`, {
      params: { dateDebut, dateFin },
      responseType: 'blob',
    });
  }
}
