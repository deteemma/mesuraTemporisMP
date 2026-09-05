import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estConnecte()) {
    return router.parseUrl('/connexion');
  }

  if (authService.utilisateurCourant()?.doitChangerMotDePasse) {
    return router.parseUrl('/changer-mot-de-passe');
  }

  return true;
};

export const roleAdministrateurGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.utilisateurCourant()?.role !== 'administrateur') {
    return router.parseUrl('/saisie-temps');
  }

  return true;
};
