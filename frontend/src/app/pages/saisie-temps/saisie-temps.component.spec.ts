import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { API_BASE_URL } from '../../api-base-url';
import { NotificationService } from '../../shared/notification.service';
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

  it('met à jour le compteur du chronomètre actif au fil du temps et le nettoie à la destruction', fakeAsync(() => {
    const debut = new Date('2026-01-05T09:00:00.000Z').getTime();
    spyOn(Date, 'now').and.returnValue(debut);

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
    httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

    expect(fixture.componentInstance.compteurEnCours).toBe('00:00');

    (Date.now as jasmine.Spy).and.returnValue(debut + 5 * 60 * 1000);
    tick(5 * 60 * 1000);

    expect(fixture.componentInstance.compteurEnCours).toBe('00:05');

    fixture.destroy();
    const valeurApresDestruction = fixture.componentInstance.compteurEnCours;

    (Date.now as jasmine.Spy).and.returnValue(debut + 10 * 60 * 1000);
    tick(5 * 60 * 1000);

    expect(fixture.componentInstance.compteurEnCours).toBe(valeurApresDestruction);
  }));

  describe('édition à la volée des heures', () => {
    const imputationTerminee = {
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: '2026-01-05T10:00:00.000Z',
    };

    function initialiserAvecImputationTerminee(): void {
      TestBed.configureTestingModule({
        imports: [SaisieTempsComponent, HttpClientTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SaisieTempsComponent);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();

      httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([imputationTerminee]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/p1/activites`).flush([{ id: 'a1', nom: 'Développement', projetId: 'p1' }]);
    }

    it('enregistre une édition réussie de heureFin et met à jour la liste', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;

      composant.demarrerEdition(imputationTerminee as any, 'heureFin');
      expect(composant.editionChamp).toEqual({ imputationId: 'i1', champ: 'heureFin' });

      composant.valeurEdition = '11:30';
      composant.confirmerEdition(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/i1`);
      expect(requete.request.method).toBe('PATCH');
      requete.flush({ ...imputationTerminee, heureFin: '2026-01-05T11:30:00.000Z' });

      expect(composant.imputationsDuJour[0].heureFin).toBe('2026-01-05T11:30:00.000Z');
      expect(composant.editionChamp).toBeNull();
      expect(composant.erreurEdition).toBeNull();
      // Le groupe correspondant reflète aussi la mise à jour (total recalculé).
      expect(composant.groupesImputations[0].totalMinutes).toBe(150);
    });

    it('n\'autorise pas l\'édition sur une Imputation sans heureFin (chrono actif)', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const imputationOuverte = { ...imputationTerminee, id: 'i2', heureFin: null };

      composant.demarrerEdition(imputationOuverte as any, 'heureDebut');

      expect(composant.editionChamp).toBeNull();
      const requetesEnvoyees = httpMock.match((req) => req.method === 'PATCH');
      expect(requetesEnvoyees.length).toBe(0);
    });

    it('Échap annule l\'édition sans effet de bord', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;

      composant.demarrerEdition(imputationTerminee as any, 'heureDebut');
      composant.valeurEdition = '08:00';
      composant.annulerEdition();

      expect(composant.editionChamp).toBeNull();
      expect(composant.imputationsDuJour[0].heureDebut).toBe('2026-01-05T09:00:00.000Z');

      const requetesEnvoyees = httpMock.match((req) => req.method === 'PATCH');
      expect(requetesEnvoyees.length).toBe(0);
    });

    it('affiche une erreur et ne modifie pas la donnée quand le serveur rejette l\'édition', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;

      composant.demarrerEdition(imputationTerminee as any, 'heureFin');
      composant.valeurEdition = '08:00';
      composant.confirmerEdition(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/i1`);
      requete.flush(
        { message: "La modification n'a pas pu être enregistrée" },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(composant.erreurEdition).toBeTruthy();
      expect(composant.imputationsDuJour[0].heureFin).toBe('2026-01-05T10:00:00.000Z');
    });

    it('un franchissement de minuit ne déclenche plus le chemin d\'erreur (édition réussie côté serveur, Scission automatique)', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, 'afficher');

      composant.demarrerEdition(imputationTerminee as any, 'heureFin');
      composant.valeurEdition = '08:00';
      composant.confirmerEdition(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/i1`);
      requete.flush({
        ...imputationTerminee,
        heureFin: '2026-01-05T23:59:59.999Z',
        scission: {
          id: 'i2',
          utilisateurId: 'u1',
          projetId: 'p1',
          activiteId: 'a1',
          heureDebut: '2026-01-06T00:00:00.000Z',
          heureFin: '2026-01-06T08:00:00.000Z',
        },
      });

      expect(composant.erreurEdition).toBeNull();
      expect(composant.imputationsDuJour[0].heureFin).toBe('2026-01-05T23:59:59.999Z');
      expect(notificationService.afficher).toHaveBeenCalled();
    });

    it('déclenche une notification nommant le jour de la nouvelle Imputation quand la réponse porte une Scission, sans l\'ajouter à la liste du jour courant', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, 'afficher');

      composant.demarrerEdition(imputationTerminee as any, 'heureFin');
      composant.valeurEdition = '08:00';
      composant.confirmerEdition(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/i1`);
      requete.flush({
        ...imputationTerminee,
        heureFin: '2026-01-05T23:59:59.999Z',
        scission: {
          id: 'i2',
          utilisateurId: 'u1',
          projetId: 'p1',
          activiteId: 'a1',
          heureDebut: '2026-01-06T00:00:00.000Z',
          heureFin: '2026-01-06T08:00:00.000Z',
        },
      });

      expect(notificationService.afficher).toHaveBeenCalledTimes(1);
      const message = (notificationService.afficher as jasmine.Spy).calls.mostRecent().args[0] as string;
      expect(message).toContain('2026-01-06');

      expect(composant.imputationsDuJour.length).toBe(1);
      expect(composant.imputationsDuJour[0].id).toBe('i1');
      expect(composant.imputationsDuJour[0].heureFin).toBe('2026-01-05T23:59:59.999Z');
      expect(composant.imputationsDuJour.some((i) => i.id === 'i2')).toBeFalse();
    });

    it('ne déclenche aucune notification quand la réponse ne porte pas de Scission', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, 'afficher');

      composant.demarrerEdition(imputationTerminee as any, 'heureFin');
      composant.valeurEdition = '11:30';
      composant.confirmerEdition(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/i1`);
      requete.flush({ ...imputationTerminee, heureFin: '2026-01-05T11:30:00.000Z', scission: null });

      expect(notificationService.afficher).not.toHaveBeenCalled();
    });
  });

  describe('bouton "relancer"', () => {
    const imputationTerminee = {
      id: 'i1',
      utilisateurId: 'u1',
      projetId: 'p1',
      activiteId: 'a1',
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: '2026-01-05T10:00:00.000Z',
    };

    function initialiserAvecImputationTerminee(): void {
      TestBed.configureTestingModule({
        imports: [SaisieTempsComponent, HttpClientTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SaisieTempsComponent);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();

      httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([imputationTerminee]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/p1/activites`).flush([{ id: 'a1', nom: 'Développement', projetId: 'p1' }]);
    }

    it('relancer une ligne démarre un chronomètre avec le projetId/activiteId de cette ligne', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;

      composant.relancerImputation(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/chrono/start`);
      expect(requete.request.method).toBe('POST');
      expect(requete.request.body).toEqual({ projetId: 'p1', activiteId: 'a1' });

      requete.flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
        chronoPrecedentArrete: null,
      });

      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
      });
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([imputationTerminee]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/p1/activites`).flush([{ id: 'a1', nom: 'Développement', projetId: 'p1' }]);

      expect(composant.chronoActif?.id).toBe('i3');
    });

    it('une réponse portant un chrono précédent arrêté déclenche une notification', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, 'afficher');

      composant.relancerImputation(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/chrono/start`);
      requete.flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
        chronoPrecedentArrete: {
          id: 'i2',
          utilisateurId: 'u1',
          projetId: 'p1',
          activiteId: 'a1',
          heureDebut: '2026-01-05T11:00:00.000Z',
          heureFin: '2026-01-05T12:00:00.000Z',
        },
      });

      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
      });
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([imputationTerminee]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/p1/activites`).flush([{ id: 'a1', nom: 'Développement', projetId: 'p1' }]);

      expect(notificationService.afficher).toHaveBeenCalledTimes(1);
    });

    it('ne déclenche aucune notification quand la réponse ne porte pas de chrono précédent arrêté', () => {
      initialiserAvecImputationTerminee();
      const composant = fixture.componentInstance;
      const notificationService = TestBed.inject(NotificationService);
      spyOn(notificationService, 'afficher');

      composant.relancerImputation(imputationTerminee as any);

      const requete = httpMock.expectOne(`${API_BASE_URL}/imputations/chrono/start`);
      requete.flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
        chronoPrecedentArrete: null,
      });

      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
        id: 'i3',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T12:00:00.000Z',
        heureFin: null,
      });
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([imputationTerminee]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/p1/activites`).flush([{ id: 'a1', nom: 'Développement', projetId: 'p1' }]);

      expect(notificationService.afficher).not.toHaveBeenCalled();
    });

    it('le bouton "relancer" est désactivé pour la ligne correspondant au chrono actif, actif pour les autres', () => {
      TestBed.configureTestingModule({
        imports: [SaisieTempsComponent, HttpClientTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SaisieTempsComponent);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();

      httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush({
        id: 'i-actif',
        utilisateurId: 'u1',
        projetId: 'p1',
        activiteId: 'a1',
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: null,
      });
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush([]);

      const composant = fixture.componentInstance;

      const ligneCorrespondante = { ...imputationTerminee, projetId: 'p1', activiteId: 'a1' };
      const ligneDifferente = { ...imputationTerminee, id: 'i4', projetId: 'p1', activiteId: 'a2' };

      expect(composant.estChronoActifPourLigne(ligneCorrespondante as any)).toBeTrue();
      expect(composant.estChronoActifPourLigne(ligneDifferente as any)).toBeFalse();
    });
  });

  describe('regroupement des Imputations terminées par Projet et Activité', () => {
    function initialiserAvecImputations(imputations: any[]): void {
      TestBed.configureTestingModule({
        imports: [SaisieTempsComponent, HttpClientTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SaisieTempsComponent);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();

      httpMock.expectOne(`${API_BASE_URL}/projets`).flush([]);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations/chrono/status`).flush(null);
      httpMock.expectOne((req) => req.url === `${API_BASE_URL}/imputations`).flush(imputations);

      const projetIds = [...new Set(imputations.map((i) => i.projetId))];
      for (const projetId of projetIds) {
        httpMock.expectOne((req) => req.url === `${API_BASE_URL}/projets/${projetId}/activites`).flush([]);
      }
    }

    it('regroupe les Imputations terminées par couple projetId/activiteId, avec le total cumulé et le nombre de lignes', () => {
      initialiserAvecImputations([
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
        { id: 'i2', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T13:00:00.000Z', heureFin: '2026-01-05T14:30:00.000Z' },
        { id: 'i3', utilisateurId: 'u1', projetId: 'p2', activiteId: 'a2', heureDebut: '2026-01-05T08:00:00.000Z', heureFin: '2026-01-05T08:30:00.000Z' },
      ]);
      const composant = fixture.componentInstance;

      expect(composant.groupesImputations.length).toBe(2);

      const groupeP1A1 = composant.groupesImputations.find((g) => g.projetId === 'p1' && g.activiteId === 'a1');
      expect(groupeP1A1?.imputations.length).toBe(2);
      expect(groupeP1A1?.totalMinutes).toBe(150);

      const groupeP2A2 = composant.groupesImputations.find((g) => g.projetId === 'p2' && g.activiteId === 'a2');
      expect(groupeP2A2?.imputations.length).toBe(1);
      expect(groupeP2A2?.totalMinutes).toBe(30);
    });

    it('calcule un total cumulé non plafonné quand un groupe dépasse 24h', () => {
      initialiserAvecImputations([
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T00:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
        { id: 'i2', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T10:00:00.000Z', heureFin: '2026-01-05T20:00:00.000Z' },
        { id: 'i3', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T20:00:00.000Z', heureFin: '2026-01-06T06:00:00.000Z' },
      ]);
      const composant = fixture.componentInstance;

      expect(composant.groupesImputations.length).toBe(1);
      expect(composant.groupesImputations[0].totalMinutes).toBe(30 * 60);
      expect(composant.formatMinutesHHMM(composant.groupesImputations[0].totalMinutes)).toBe('30:00');
    });

    it('les groupes sont repliés par défaut', () => {
      initialiserAvecImputations([
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
        { id: 'i2', utilisateurId: 'u1', projetId: 'p2', activiteId: 'a2', heureDebut: '2026-01-05T08:00:00.000Z', heureFin: '2026-01-05T08:30:00.000Z' },
      ]);
      const composant = fixture.componentInstance;

      expect(composant.groupesImputations.every((g) => g.estDeplie === false)).toBeTrue();
    });

    it('basculerGroupe déplie puis replie un groupe individuellement, sans affecter les autres groupes', () => {
      initialiserAvecImputations([
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
        { id: 'i2', utilisateurId: 'u1', projetId: 'p2', activiteId: 'a2', heureDebut: '2026-01-05T08:00:00.000Z', heureFin: '2026-01-05T08:30:00.000Z' },
      ]);
      const composant = fixture.componentInstance;
      const [groupeUn, groupeDeux] = composant.groupesImputations;

      composant.basculerGroupe(groupeUn);
      expect(groupeUn.estDeplie).toBeTrue();
      expect(groupeDeux.estDeplie).toBeFalse();

      composant.basculerGroupe(groupeUn);
      expect(groupeUn.estDeplie).toBeFalse();
    });

    it('ordonne les groupes selon l\'heure de départ la plus ancienne parmi leurs lignes (ordre chronologique)', () => {
      initialiserAvecImputations([
        // p1/a1 : lignes désordonnées, la plus ancienne (09:00) arrive en second dans le tableau.
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T13:00:00.000Z', heureFin: '2026-01-05T14:00:00.000Z' },
        { id: 'i2', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
        // p2/a2 : une seule ligne, plus tôt que le groupe p1/a1 mais plus tard que p3/a3.
        { id: 'i3', utilisateurId: 'u1', projetId: 'p2', activiteId: 'a2', heureDebut: '2026-01-05T08:00:00.000Z', heureFin: '2026-01-05T08:30:00.000Z' },
        // p3/a3 : le tout premier de la journée.
        { id: 'i4', utilisateurId: 'u1', projetId: 'p3', activiteId: 'a3', heureDebut: '2026-01-05T06:00:00.000Z', heureFin: '2026-01-05T07:00:00.000Z' },
      ]);
      const composant = fixture.componentInstance;

      expect(composant.groupesImputations.map((g) => `${g.projetId}/${g.activiteId}`)).toEqual(['p3/a3', 'p2/a2', 'p1/a1']);
    });

    it('n\'émet aucune requête vers /rapports/journalier', () => {
      initialiserAvecImputations([
        { id: 'i1', utilisateurId: 'u1', projetId: 'p1', activiteId: 'a1', heureDebut: '2026-01-05T09:00:00.000Z', heureFin: '2026-01-05T10:00:00.000Z' },
      ]);

      const requetesJournalier = httpMock.match((req) => req.url === `${API_BASE_URL}/rapports/journalier`);
      expect(requetesJournalier.length).toBe(0);
    });
  });
});
