import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { API_BASE_URL } from '../../api-base-url';
import { ActivitesComponent } from './activites.component';

describe('ActivitesComponent', () => {
  let fixture: ComponentFixture<ActivitesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitesComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ projetId: 'projet-1' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitesComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets/projet-1/activites`).flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('liste les Activités du Projet', () => {
    fixture.componentInstance.rafraichir();
    httpMock
      .expectOne(`${API_BASE_URL}/projets/projet-1/activites`)
      .flush([{ id: '1', nom: 'Développement', projetId: 'projet-1' }]);

    expect(fixture.componentInstance.activites.length).toBe(1);
  });

  it('renomme une Activité puis rafraîchit la liste', () => {
    fixture.componentInstance.renommageEnCours['1'] = 'Développement backend';
    fixture.componentInstance.renommer('1');

    httpMock
      .expectOne(`${API_BASE_URL}/projets/projet-1/activites/1`)
      .flush({ id: '1', nom: 'Développement backend', projetId: 'projet-1' });
    httpMock
      .expectOne(`${API_BASE_URL}/projets/projet-1/activites`)
      .flush([{ id: '1', nom: 'Développement backend', projetId: 'projet-1' }]);

    expect(fixture.componentInstance.activites[0].nom).toBe('Développement backend');
  });

  it('supprime une Activité puis rafraîchit la liste', () => {
    fixture.componentInstance.activites = [{ id: '1', nom: 'Développement', projetId: 'projet-1' }];

    fixture.componentInstance.supprimer('1');

    httpMock.expectOne(`${API_BASE_URL}/projets/projet-1/activites/1`).flush(null);
    httpMock.expectOne(`${API_BASE_URL}/projets/projet-1/activites`).flush([]);

    expect(fixture.componentInstance.activites).toEqual([]);
  });
});
