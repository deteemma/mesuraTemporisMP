import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from '../../api-base-url';
import { ChangerMotDePasseComponent } from './changer-mot-de-passe.component';

describe('ChangerMotDePasseComponent', () => {
  let fixture: ComponentFixture<ChangerMotDePasseComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangerMotDePasseComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangerMotDePasseComponent);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('redirige vers la saisie de temps après un changement réussi', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    fixture.componentInstance.motDePasseActuel = 'admin';
    fixture.componentInstance.nouveauMotDePasse = 'nouveau123';
    fixture.componentInstance.valider();

    const requete = httpMock.expectOne(`${API_BASE_URL}/auth/changer-mot-de-passe`);
    requete.flush({
      utilisateur: { id: '1', login: 'admin', nom: 'Admin', role: 'administrateur', doitChangerMotDePasse: false },
    });

    expect(navigateSpy).toHaveBeenCalledWith('/saisie-temps');
  });

  it('affiche une erreur si le mot de passe actuel est incorrect', () => {
    fixture.componentInstance.motDePasseActuel = 'mauvais';
    fixture.componentInstance.nouveauMotDePasse = 'nouveau123';
    fixture.componentInstance.valider();

    const requete = httpMock.expectOne(`${API_BASE_URL}/auth/changer-mot-de-passe`);
    requete.flush({ message: 'Mot de passe actuel incorrect' }, { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.messageErreur).toBe('Mot de passe actuel incorrect');
  });
});
