import { Routes } from '@angular/router';
import { ChangerMotDePasseComponent } from './pages/changer-mot-de-passe/changer-mot-de-passe.component';
import { ActivitesComponent } from './pages/activites/activites.component';
import { LoginComponent } from './pages/login/login.component';
import { ProjetsComponent } from './pages/projets/projets.component';
import { RapportComponent } from './pages/rapport/rapport.component';
import { SaisieTempsComponent } from './pages/saisie-temps/saisie-temps.component';
import { UtilisateursComponent } from './pages/utilisateurs/utilisateurs.component';
import { authGuard, roleAdministrateurGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'connexion', component: LoginComponent },
  { path: 'changer-mot-de-passe', component: ChangerMotDePasseComponent },
  { path: 'saisie-temps', component: SaisieTempsComponent, canActivate: [authGuard] },
  { path: 'rapport', component: RapportComponent, canActivate: [authGuard] },
  { path: 'projets', component: ProjetsComponent, canActivate: [authGuard] },
  {
    path: 'projets/:projetId/activites',
    component: ActivitesComponent,
    canActivate: [authGuard, roleAdministrateurGuard],
  },
  {
    path: 'utilisateurs',
    component: UtilisateursComponent,
    canActivate: [authGuard, roleAdministrateurGuard],
  },
  { path: '', redirectTo: 'saisie-temps', pathMatch: 'full' },
];
