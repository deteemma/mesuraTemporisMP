import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from '../../api-base-url';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('redirige vers le changement de mot de passe obligatoire si nécessaire', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    fixture.componentInstance.login = 'admin';
    fixture.componentInstance.motDePasse = 'admin';
    fixture.componentInstance.seConnecter();

    const requete = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    requete.flush({
      token: 'jeton-de-test',
      utilisateur: { id: '1', login: 'admin', nom: 'Admin', role: 'administrateur', doitChangerMotDePasse: true },
    });

    expect(navigateSpy).toHaveBeenCalledWith('/changer-mot-de-passe');
  });

  it('redirige vers la saisie de temps quand le mot de passe est déjà à jour', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    fixture.componentInstance.login = 'jdupont';
    fixture.componentInstance.motDePasse = 'secret';
    fixture.componentInstance.seConnecter();

    const requete = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    requete.flush({
      token: 'jeton-de-test',
      utilisateur: { id: '2', login: 'jdupont', nom: 'Jean', role: 'utilisateur', doitChangerMotDePasse: false },
    });

    expect(navigateSpy).toHaveBeenCalledWith('/saisie-temps');
  });

  it('affiche un message d\'erreur sur des identifiants invalides', () => {
    fixture.componentInstance.login = 'admin';
    fixture.componentInstance.motDePasse = 'mauvais';
    fixture.componentInstance.seConnecter();

    const requete = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    requete.flush({ message: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.messageErreur).toBe('Identifiants invalides');
  });
});
