import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DELAI_NOTIFICATION_MS, NotificationService } from '../notification.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('affiche le message déclenché via le service', () => {
    notificationService.afficher('Imputation supprimée');
    fixture.detectChanges();

    const texte = fixture.nativeElement.textContent as string;
    expect(texte).toContain('Imputation supprimée');
  });

  it('fait disparaître le message du DOM après le délai', fakeAsync(() => {
    notificationService.afficher('Imputation supprimée');
    fixture.detectChanges();
    expect((fixture.nativeElement.textContent as string)).toContain('Imputation supprimée');

    tick(DELAI_NOTIFICATION_MS);
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).not.toContain('Imputation supprimée');
  }));

  it('ferme la notification au clic sur le bouton de fermeture', () => {
    notificationService.afficher('Imputation supprimée');
    fixture.detectChanges();

    const bouton: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="toast-fermer"]');
    bouton.click();
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).not.toContain('Imputation supprimée');
  });
});
