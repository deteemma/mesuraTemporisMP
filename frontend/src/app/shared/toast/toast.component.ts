import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from '../notification.service';

/**
 * Affiche les notifications transitoires déclenchées via `NotificationService.afficher()`.
 * À placer une seule fois, typiquement dans le template racine de l'application.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];

  private abonnement?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.abonnement = this.notificationService.notifications$.subscribe(
      (notifications) => (this.notifications = notifications),
    );
  }

  ngOnDestroy(): void {
    this.abonnement?.unsubscribe();
  }

  fermer(id: number): void {
    this.notificationService.fermer(id);
  }
}
