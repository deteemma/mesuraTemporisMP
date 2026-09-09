import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
}

/** Délai d'affichage par défaut avant disparition automatique d'une notification. */
export const DELAI_NOTIFICATION_MS = 4000;

/**
 * Permet à n'importe quel composant de déclencher une notification transitoire
 * (toast) affichée par `ToastComponent`. Les notifications s'empilent et
 * disparaissent automatiquement après un délai.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  readonly notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private prochainId = 1;

  /** Déclenche l'affichage d'un message transitoire, fermé automatiquement après `dureeMs`. */
  afficher(message: string, dureeMs: number = DELAI_NOTIFICATION_MS): void {
    const id = this.prochainId++;
    this.notificationsSubject.next([...this.notificationsSubject.value, { id, message }]);

    setTimeout(() => this.fermer(id), dureeMs);
  }

  /** Ferme une notification avant l'expiration de son délai (ex. clic utilisateur). */
  fermer(id: number): void {
    this.notificationsSubject.next(this.notificationsSubject.value.filter((notification) => notification.id !== id));
  }
}
