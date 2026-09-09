import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DELAI_NOTIFICATION_MS, NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('affiche un message lors de l\'appel à afficher()', () => {
    let dernieresNotifications: { id: number; message: string }[] = [];
    service.notifications$.subscribe((notifications) => (dernieresNotifications = notifications));

    service.afficher('Imputation supprimée');

    expect(dernieresNotifications.length).toBe(1);
    expect(dernieresNotifications[0].message).toBe('Imputation supprimée');
  });

  it('fait disparaître le message après le délai par défaut', fakeAsync(() => {
    let dernieresNotifications: { id: number; message: string }[] = [];
    service.notifications$.subscribe((notifications) => (dernieresNotifications = notifications));

    service.afficher('Imputation supprimée');
    expect(dernieresNotifications.length).toBe(1);

    tick(DELAI_NOTIFICATION_MS);

    expect(dernieresNotifications.length).toBe(0);
  }));

  it('ne fait pas disparaître le message avant l\'expiration du délai', fakeAsync(() => {
    let dernieresNotifications: { id: number; message: string }[] = [];
    service.notifications$.subscribe((notifications) => (dernieresNotifications = notifications));

    service.afficher('Imputation supprimée');
    tick(DELAI_NOTIFICATION_MS - 1);

    expect(dernieresNotifications.length).toBe(1);

    tick(1);
  }));

  it('empile plusieurs notifications simultanées', () => {
    let dernieresNotifications: { id: number; message: string }[] = [];
    service.notifications$.subscribe((notifications) => (dernieresNotifications = notifications));

    service.afficher('Premier message');
    service.afficher('Deuxième message');

    expect(dernieresNotifications.length).toBe(2);
    expect(dernieresNotifications[0].message).toBe('Premier message');
    expect(dernieresNotifications[1].message).toBe('Deuxième message');
  });

  it('permet de fermer une notification manuellement avant l\'expiration du délai', () => {
    let dernieresNotifications: { id: number; message: string }[] = [];
    service.notifications$.subscribe((notifications) => (dernieresNotifications = notifications));

    service.afficher('Imputation supprimée');
    const id = dernieresNotifications[0].id;
    service.fermer(id);

    expect(dernieresNotifications.length).toBe(0);
  });
});
