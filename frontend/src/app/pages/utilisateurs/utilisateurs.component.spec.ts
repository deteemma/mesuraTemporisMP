import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../api-base-url';
import { UtilisateursComponent } from './utilisateurs.component';

describe('UtilisateursComponent', () => {
  let fixture: ComponentFixture<UtilisateursComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateursComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UtilisateursComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${API_BASE_URL}/utilisateurs`).flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('liste les Utilisateurs existants', () => {
    fixture.componentInstance.rafraichir();
    httpMock
      .expectOne(`${API_BASE_URL}/utilisateurs`)
      .flush([{ id: '1', login: 'jdupont', nom: 'Jean Dupont', role: 'utilisateur', doitChangerMotDePasse: true }]);

    expect(fixture.componentInstance.utilisateurs.length).toBe(1);
    expect(fixture.componentInstance.utilisateurs[0].login).toBe('jdupont');
  });

  it('crée un Utilisateur puis rafraîchit la liste', () => {
    fixture.componentInstance.nouveauLogin = 'jdupont';
    fixture.componentInstance.nouveauNom = 'Jean Dupont';
    fixture.componentInstance.creer();

    httpMock
      .expectOne(`${API_BASE_URL}/utilisateurs`)
      .flush({ id: '1', login: 'jdupont', nom: 'Jean Dupont', role: 'utilisateur', doitChangerMotDePasse: true });

    httpMock.expectOne(`${API_BASE_URL}/utilisateurs`).flush([]);

    expect(fixture.componentInstance.nouveauLogin).toBe('');
  });

  it('supprime un Utilisateur puis rafraîchit la liste', () => {
    fixture.componentInstance.utilisateurs = [
      { id: '1', login: 'jdupont', nom: 'Jean Dupont', role: 'utilisateur', doitChangerMotDePasse: true },
    ];

    fixture.componentInstance.supprimer('1');

    httpMock.expectOne(`${API_BASE_URL}/utilisateurs/1`).flush(null);
    httpMock.expectOne(`${API_BASE_URL}/utilisateurs`).flush([]);

    expect(fixture.componentInstance.utilisateurs).toEqual([]);
  });
});
