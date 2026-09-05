import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../api-base-url';
import { AuthService } from '../../services/auth.service';
import { ProjetsComponent } from './projets.component';

describe('ProjetsComponent', () => {
  let fixture: ComponentFixture<ProjetsComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetsComponent, HttpClientTestingModule],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.utilisateurCourant.set({
      id: 'admin-id',
      login: 'admin',
      nom: 'Admin',
      role: 'administrateur',
      doitChangerMotDePasse: false,
    });

    fixture = TestBed.createComponent(ProjetsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
    httpMock.expectOne(`${API_BASE_URL}/utilisateurs`).flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('liste les Projets existants', () => {
    fixture.componentInstance.rafraichir();
    httpMock
      .expectOne(`${API_BASE_URL}/projets`)
      .flush([{ id: '1', nom: 'Projet Alpha', statut: 'actif', utilisateursAffectes: [] }]);

    expect(fixture.componentInstance.projets.length).toBe(1);
    expect(fixture.componentInstance.projets[0].nom).toBe('Projet Alpha');
  });

  it('crée un Projet puis rafraîchit la liste', () => {
    fixture.componentInstance.nouveauNomProjet = 'Projet Alpha';
    fixture.componentInstance.creer();

    httpMock
      .expectOne(`${API_BASE_URL}/projets`)
      .flush({ id: '1', nom: 'Projet Alpha', statut: 'actif', utilisateursAffectes: [] });
    httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);

    expect(fixture.componentInstance.nouveauNomProjet).toBe('');
  });

  it('affecte un Utilisateur à un Projet', () => {
    fixture.componentInstance.affectationChoisie['1'] = 'user-1';
    fixture.componentInstance.affecter('1');

    httpMock
      .expectOne(`${API_BASE_URL}/projets/1/utilisateurs`)
      .flush({ id: '1', nom: 'Projet Alpha', statut: 'actif', utilisateursAffectes: ['user-1'] });
    httpMock
      .expectOne(`${API_BASE_URL}/projets`)
      .flush([{ id: '1', nom: 'Projet Alpha', statut: 'actif', utilisateursAffectes: ['user-1'] }]);

    expect(fixture.componentInstance.projets[0].utilisateursAffectes).toContain('user-1');
  });
});
