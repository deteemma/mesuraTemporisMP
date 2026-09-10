import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../api-base-url';
import { RapportComponent } from './rapport.component';

describe('RapportComponent', () => {
  let fixture: ComponentFixture<RapportComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RapportComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('génère un rapport pour la plage de dates choisie', () => {
    fixture.componentInstance.dateDebut = '2026-01-01';
    fixture.componentInstance.dateFin = '2026-01-31';
    fixture.componentInstance.genererRapport();

    const requete = httpMock.expectOne(
      (req) => req.url === `${API_BASE_URL}/rapports/plage` && req.params.get('dateDebut') === '2026-01-01',
    );
    requete.flush({
      dateDebut: '2026-01-01',
      dateFin: '2026-01-31',
      lignes: [
        {
          utilisateurId: 'u1',
          utilisateurLogin: 'jdupont',
          projetId: 'p1',
          projetNom: 'Projet Alpha',
          activiteId: 'a1',
          activiteNom: 'Développement',
          journee: '2026-01-05',
          dureeSecondes: 3600,
        },
      ],
      totalSecondes: 3600,
    });

    expect(fixture.componentInstance.rapport?.lignes.length).toBe(1);
    expect(fixture.componentInstance.rapport?.totalSecondes).toBe(3600);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="rapport-total"]').previousElementSibling.textContent).toContain(
      '01:00:00',
    );
  });

  it('déclenche l\'export Excel avec la même plage de dates', () => {
    fixture.componentInstance.dateDebut = '2026-01-01';
    fixture.componentInstance.dateFin = '2026-01-31';
    fixture.componentInstance.exporter();

    const requete = httpMock.expectOne(
      (req) => req.url === `${API_BASE_URL}/rapports/plage/export` && req.params.get('dateFin') === '2026-01-31',
    );
    expect(requete.request.method).toBe('GET');
    requete.flush(new Blob(['contenu']));
  });

  it('ne génère pas de rapport sans plage de dates complète', () => {
    fixture.componentInstance.dateDebut = '2026-01-01';
    fixture.componentInstance.genererRapport();

    const requetesEnvoyees = httpMock.match((req) => req.url === `${API_BASE_URL}/rapports/plage`);
    expect(requetesEnvoyees.length).toBe(0);
  });
});
