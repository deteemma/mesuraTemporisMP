import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { Activite } from '../../models/activite';
import { Imputation } from '../../models/imputation';
import { Projet } from '../../models/projet';
import { ActiviteService } from '../../services/activite.service';
import { ImputationService } from '../../services/imputation.service';
import { ProjetService } from '../../services/projet.service';
import { NotificationService } from '../../shared/notification.service';
import { formatDuree, formatHeure, formatSecondesHHMMSS } from '../../shared/duree.util';

const INTERVALLE_COMPTEUR_MS = 1000;

function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

// Regroupement des Imputations terminées d'une journée par couple (projetId,
// activiteId) — voir ticket 08. `estDeplie` est un état purement local au
// composant (jamais persisté) : chaque groupe démarre replié.
export interface GroupeImputations {
  projetId: string;
  activiteId: string;
  imputations: Imputation[];
  totalSecondes: number;
  estDeplie: boolean;
}

@Component({
  selector: 'app-saisie-temps',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './saisie-temps.component.html',
  styleUrl: './saisie-temps.component.scss',
})
export class SaisieTempsComponent implements OnInit, OnDestroy {
  projets: Projet[] = [];
  activites: Activite[] = [];
  chronoActif: Imputation | null = null;
  imputationsDuJour: Imputation[] = [];
  groupesImputations: GroupeImputations[] = [];
  compteurEnCours = '00:00:00';

  projetChoisi = '';
  activiteChoisie = '';
  nomNouvelleActivite = '';

  projetSaisieManuelle = '';
  activiteSaisieManuelle = '';
  heureDebutManuelle = '';
  heureFinManuelle = '';

  editionChamp: { imputationId: string; champ: 'heureDebut' | 'heureFin' } | null = null;
  valeurEdition = '';
  erreurEdition: string | null = null;
  private enregistrementEditionEnCours = false;

  formatHeure = formatHeure;
  formatDuree = formatDuree;
  formatSecondesHHMMSS = formatSecondesHHMMSS;

  private capNomsActivites: Record<string, string> = {};
  private abonnementCompteur: Subscription | null = null;

  constructor(
    private projetService: ProjetService,
    private activiteService: ActiviteService,
    private imputationService: ImputationService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.projetService.lister().subscribe((projets) => (this.projets = projets));
    this.rafraichirChrono();
    this.rafraichirImputationsDuJour();
  }

  ngOnDestroy(): void {
    this.arreterCompteur();
  }

  nomProjet(id: string): string {
    return this.projets.find((p) => p.id === id)?.nom ?? '—';
  }

  nomActivite(id: string): string {
    return this.capNomsActivites[id] ?? '—';
  }

  private rafraichirChrono(): void {
    this.imputationService.statutChrono().subscribe((imputation) => {
      this.chronoActif = imputation;
      this.gererCompteurChronoActif();
    });
  }

  private gererCompteurChronoActif(): void {
    this.arreterCompteur();
    if (!this.chronoActif) {
      this.compteurEnCours = '00:00:00';
      return;
    }
    this.mettreAJourCompteur();
    this.abonnementCompteur = interval(INTERVALLE_COMPTEUR_MS).subscribe(() => this.mettreAJourCompteur());
  }

  private mettreAJourCompteur(): void {
    if (!this.chronoActif) return;
    const secondesEcoulees = Math.floor((Date.now() - new Date(this.chronoActif.heureDebut).getTime()) / 1000);
    this.compteurEnCours = formatSecondesHHMMSS(secondesEcoulees);
  }

  private arreterCompteur(): void {
    this.abonnementCompteur?.unsubscribe();
    this.abonnementCompteur = null;
  }

  private rafraichirImputationsDuJour(): void {
    this.imputationService.listerDuJour(dateDuJour()).subscribe((imputations) => {
      this.imputationsDuJour = imputations;
      this.groupesImputations = this.regrouperParProjetEtActivite(imputations);
      this.completerCacheNomsActivites(imputations);
    });
  }

  // Regroupe les Imputations terminées (heureFin renseignée — le chrono actif,
  // s'il apparaît dans la liste du jour, reste hors groupe) par couple
  // (projetId, activiteId). Les groupes sont ordonnés par l'heure de départ la
  // plus ancienne parmi leurs lignes (ordre chronologique du déroulé de la
  // journée). L'état déplié/replié de chaque groupe est conservé d'un
  // rafraîchissement à l'autre en le retrouvant par clé projetId+activiteId
  // dans l'état précédent ; à défaut (premier chargement, nouveau groupe), un
  // groupe démarre toujours replié.
  private regrouperParProjetEtActivite(imputations: Imputation[]): GroupeImputations[] {
    const groupesParCle = new Map<string, GroupeImputations>();

    for (const imputation of imputations) {
      if (!imputation.heureFin) continue;
      const cle = this.cleGroupe(imputation.projetId, imputation.activiteId);
      let groupe = groupesParCle.get(cle);
      if (!groupe) {
        const estDeplie = this.groupesImputations.find(
          (g) => this.cleGroupe(g.projetId, g.activiteId) === cle,
        )?.estDeplie ?? false;
        groupe = { projetId: imputation.projetId, activiteId: imputation.activiteId, imputations: [], totalSecondes: 0, estDeplie };
        groupesParCle.set(cle, groupe);
      }
      groupe.imputations.push(imputation);
      groupe.totalSecondes += this.secondesImputation(imputation);
    }

    return [...groupesParCle.values()].sort(
      (a, b) => this.heureDebutLaPlusAncienne(a).getTime() - this.heureDebutLaPlusAncienne(b).getTime(),
    );
  }

  private cleGroupe(projetId: string, activiteId: string): string {
    return `${projetId}::${activiteId}`;
  }

  private secondesImputation(imputation: Imputation): number {
    return Math.round(
      (new Date(imputation.heureFin as string).getTime() - new Date(imputation.heureDebut).getTime()) / 1000,
    );
  }

  private heureDebutLaPlusAncienne(groupe: GroupeImputations): Date {
    return groupe.imputations.reduce(
      (plusAncienne, imputation) => {
        const heureDebut = new Date(imputation.heureDebut);
        return heureDebut < plusAncienne ? heureDebut : plusAncienne;
      },
      new Date(groupe.imputations[0].heureDebut),
    );
  }

  // Bascule l'état déplié/replié d'un groupe — état purement local, non
  // persisté (voir ticket 08).
  basculerGroupe(groupe: GroupeImputations): void {
    groupe.estDeplie = !groupe.estDeplie;
  }

  private completerCacheNomsActivites(imputations: Imputation[]): void {
    const projetIds = [...new Set(imputations.map((i) => i.projetId))];
    for (const projetId of projetIds) {
      this.activiteService.lister(projetId).subscribe((activites) => {
        for (const activite of activites) {
          this.capNomsActivites[activite.id] = activite.nom;
        }
      });
    }
  }

  private rafraichirApresChangement(): void {
    this.rafraichirChrono();
    this.rafraichirImputationsDuJour();
  }

  chargerActivites(projetId: string): void {
    if (!projetId) {
      this.activites = [];
      return;
    }
    this.activiteService.lister(projetId).subscribe((activites) => (this.activites = activites));
  }

  demarrerChrono(): void {
    if (!this.projetChoisi || this.chronoActif) return;
    const options = this.nomNouvelleActivite
      ? { nomNouvelleActivite: this.nomNouvelleActivite }
      : { activiteId: this.activiteChoisie };

    this.imputationService.demarrerChrono(this.projetChoisi, options).subscribe(() => {
      this.nomNouvelleActivite = '';
      this.activiteChoisie = '';
      this.rafraichirApresChangement();
    });
  }

  arreterChrono(): void {
    this.imputationService.arreterChrono().subscribe(() => this.rafraichirApresChangement());
  }

  // Bouton "relancer" (voir CONTEXT.md, entrée « Imputation ») : redémarre un
  // chronomètre avec le même Projet/Activité qu'une ligne terminée. Contrairement à
  // demarrerChrono(), aucun garde-fou sur chronoActif : le serveur arrête
  // automatiquement le chrono en cours s'il y en a un, et le signale dans la réponse.
  relancerImputation(imputation: Imputation): void {
    this.imputationService
      .demarrerChrono(imputation.projetId, { activiteId: imputation.activiteId })
      .subscribe((demarree) => {
        this.rafraichirApresChangement();
        this.notifierChronoPrecedentArreteSiPresent(demarree.chronoPrecedentArrete);
      });
  }

  // Désactive le bouton "relancer" sur la ligne dont le Projet/Activité correspond
  // déjà au chrono actuellement actif : rien de significatif à relancer.
  estChronoActifPourLigne(imputation: Imputation): boolean {
    return (
      !!this.chronoActif &&
      this.chronoActif.projetId === imputation.projetId &&
      this.chronoActif.activiteId === imputation.activiteId
    );
  }

  private notifierChronoPrecedentArreteSiPresent(chronoPrecedentArrete: Imputation | null): void {
    if (!chronoPrecedentArrete) return;
    const heure = formatHeure(chronoPrecedentArrete.heureFin as string);
    this.notificationService.afficher(`Chronomètre précédent arrêté automatiquement à ${heure}`);
  }

  ajouterImputationManuelle(): void {
    if (!this.projetSaisieManuelle || !this.activiteSaisieManuelle || !this.heureDebutManuelle || !this.heureFinManuelle) {
      return;
    }
    this.imputationService
      .creerManuelle(
        this.projetSaisieManuelle,
        this.activiteSaisieManuelle,
        new Date(this.heureDebutManuelle).toISOString(),
        new Date(this.heureFinManuelle).toISOString(),
      )
      .subscribe(() => {
        this.heureDebutManuelle = '';
        this.heureFinManuelle = '';
        this.rafraichirApresChangement();
      });
  }

  supprimerImputation(id: string): void {
    this.imputationService.supprimer(id).subscribe(() => this.rafraichirApresChangement());
  }

  // Édition à la volée de heureDebut/heureFin, réservée aux Imputations terminées
  // (pas la ligne du chrono actif). Un franchissement de minuit déclenche côté
  // backend une Scission automatique (voir ADR 0003) : l'édition réussit toujours,
  // et confirmerEdition() notifie l'Utilisateur quand une Scission a eu lieu.
  demarrerEdition(imputation: Imputation, champ: 'heureDebut' | 'heureFin'): void {
    if (!imputation.heureFin) return;
    this.erreurEdition = null;
    this.editionChamp = { imputationId: imputation.id, champ };
    this.valeurEdition = formatHeure(imputation[champ] as string);
  }

  annulerEdition(): void {
    this.editionChamp = null;
    this.valeurEdition = '';
    this.erreurEdition = null;
  }

  confirmerEdition(imputation: Imputation): void {
    if (!this.editionChamp || this.editionChamp.imputationId !== imputation.id || this.enregistrementEditionEnCours) {
      return;
    }
    if (!this.valeurEdition) {
      this.annulerEdition();
      return;
    }

    const champ = this.editionChamp.champ;
    const referenceIso = imputation[champ] ?? imputation.heureDebut;
    const nouvelleValeurIso = this.construireHeureEditee(referenceIso, this.valeurEdition);

    this.enregistrementEditionEnCours = true;
    this.imputationService.modifier(imputation.id, { [champ]: nouvelleValeurIso }).subscribe({
      next: (imputationMiseAJour) => {
        const index = this.imputationsDuJour.findIndex((i) => i.id === imputation.id);
        if (index !== -1) {
          this.imputationsDuJour[index] = imputationMiseAJour;
          this.groupesImputations = this.regrouperParProjetEtActivite(this.imputationsDuJour);
        }
        this.editionChamp = null;
        this.valeurEdition = '';
        this.erreurEdition = null;
        this.enregistrementEditionEnCours = false;
        this.notifierScissionSiPresente(imputationMiseAJour.scission);
      },
      error: (erreur) => {
        this.erreurEdition = erreur?.error?.message ?? "La modification n'a pas pu être enregistrée";
        this.enregistrementEditionEnCours = false;
      },
    });
  }

  // Scission (ADR 0003) : l'édition qui ferait franchir minuit à l'Imputation réussit
  // toujours, mais crée une nouvelle Imputation sur l'autre journée calendaire. Cette
  // nouvelle Imputation n'apparaît volontairement pas dans imputationsDuJour (limitée
  // au jour affiché) : on se contente d'informer l'Utilisateur par une notification,
  // sans dialogue de confirmation bloquant.
  private notifierScissionSiPresente(scission: Imputation | null): void {
    if (!scission) return;
    const jour = scission.heureDebut.slice(0, 10);
    this.notificationService.afficher(`Scission : une nouvelle Imputation a été créée le ${jour}`);
  }

  private construireHeureEditee(referenceIso: string, nouvelleHeureHHmm: string): string {
    const [heures, minutes] = nouvelleHeureHHmm.split(':').map(Number);
    const reference = new Date(referenceIso);
    reference.setHours(heures, minutes, 0, 0);
    return reference.toISOString();
  }
}
