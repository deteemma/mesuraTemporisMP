import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../api-base-url';
import { SaisieTempsComponent } from './saisie-temps.component';

describe('SaisieTempsComponent', () => {
  let fixture: ComponentFixture<SaisieTempsComponent>;
  let httpMock: HttpTestingController;

  function initialiserSansChronoActif(): void {
    TestBed.configureTestingModule({
      imports: [SaisieTempsComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisieTempsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([{ id: 'p1', nom: 'Projet Alpha', statut: 'actif', utilisateursAffectes: [] }]);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({ date: '2026-01-05', lignes: [], totalMinutes: 0 });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('démarre un chronomètre et rafraîchit l\'état', () => {
    initialiserSansChronoActif();
    expect(fixture.componentInstance.chronoActif).toBeNull();

    fixture.componentInstance.projetChoisi = 'p1';
    fixture.componentInstance.nomNouvelleActivite = 'Nouvelle tâche';
    fixture.componentInstance.demarrerChrono();

    httpMock
      .expectOne(`${API_BASE_URL}/imputations/chrono/start`)
      .flush({ id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: null });

    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: null,
    });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({ date: '2026-01-05', lignes: [], totalMinutes: 0 });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    expect(fixture.componentInstance.chronoActif?.id).toBe('i1');
  });

  it('n\'envoie pas de requête de démarrage si un chronomètre est déjà actif', () => {
    TestBed.configureTestingModule({
      imports: [SaisieTempsComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisieTempsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: null,
    });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({ date: '2026-01-05', lignes: [], totalMinutes: 0 });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    fixture.componentInstance.projetChoisi = 'p1';
    fixture.componentInstance.demarrerChrono();

    const requetesEnvoyees = httpMock.match(`${API_BASE_URL}/imputations/chrono/start`);
    expect(requetesEnvoyees.length).toBe(0);
  });

  it('arrête le chronomètre actif', () => {
    TestBed.configureTestingModule({
      imports: [SaisieTempsComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisieTempsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: null,
    });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({ date: '2026-01-05', lignes: [], totalMinutes: 0 });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    fixture.componentInstance.arreterChrono();

    httpMock.expectOne(`${API_BASE_URL}/imputations/chrono/stop`).flush({
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: '2026-01-05T10:00:00.000Z',
    });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({ date: '2026-01-05', lignes: [], totalMinutes: 60 });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    expect(fixture.componentInstance.chronoActif).toBeNull();
  });

  it('n\'ajoute pas d\'Imputation manuelle si le formulaire est incomplet', () => {
    initialiserSansChronoActif();

    fixture.componentInstance.projetSaisieManuelle = 'p1';
    fixture.componentInstance.ajouterImputationManuelle();

    const requetesEnvoyees = httpMock.match((req) => req.url === `${API_BASE_URL}/imputations` && req.method === 'POST');
    expect(requetesEnvoyees.length).toBe(0);
  });

  it('affiche la synthèse journalière reçue du serveur', () => {
    TestBed.configureTestingModule({
      imports: [SaisieTempsComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisieTempsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/rapports/journalier`).flush({
      date: '2026-01-05',
      lignes: [{ projetId: 'p1', projetNom: 'Projet Alpha', activiteId: 'a1', activiteNom: 'Développement', dureeMinutes: 90 }],
      totalMinutes: 90,
    });
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    expect(fixture.componentInstance.synthese?.totalMinutes).toBe(90);
    expect(fixture.componentInstance.synthese?.lignes[0].activiteNom).toBe('Développement');
  });
});
