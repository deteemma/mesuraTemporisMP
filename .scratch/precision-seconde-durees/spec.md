Status: ready-for-agent

# Passage des Durées au format hh:mm:ss

## Problem Statement

Depuis le passage des durées au format `hh:mm` (voir `.scratch/ameliorations-saisie-temps/`), le compteur du chronomètre actif se rafraîchit chaque seconde mais n'affiche toujours qu'une résolution à la minute : rien ne bouge à l'écran pendant qu'un utilisateur regarde son chronomètre tourner sur une minute entière. Cette perte de confort de lecture touche aussi les autres affichages de Durée de l'application (lignes et totaux de la Saisie de temps, page Rapport, export Excel), qui partagent ou dupliquent la même granularité minute alors que les heures de début/fin sous-jacentes sont déjà précises à la seconde pour toute Imputation issue d'un chronomètre.

## Solution

Toutes les Durées affichées dans l'application passent du format `hh:mm` au format `hh:mm:ss`, zero-paddé, sans plafond à 24h (principe déjà en place, simplement étendu aux secondes) :

- Le compteur du chronomètre actif (Saisie de temps) affiche et met à jour les secondes réellement écoulées, pas une valeur figée à la minute.
- Les durées des lignes d'Imputation terminées et les totaux de groupe (Saisie de temps) recalculent la Durée à partir des secondes exactes plutôt que par somme de minutes déjà arrondies par ligne.
- La page Rapport abandonne son format texte libre ("2 h 15", "45 min") au profit du même format `hh:mm:ss` que le reste de l'application, avec la même logique de recalcul à partir des secondes exactes côté agrégation serveur.
- L'export Excel du Rapport conserve sa colonne "Durée (minutes)" existante et gagne une nouvelle colonne texte "Durée (hh:mm:ss)".
- La saisie manuelle des heures de début/fin (édition à la volée) reste au format `hh:mm` : elle ne gagne pas de champ secondes. Une Imputation éditée manuellement affiche donc `:00` en secondes, ce qui reflète fidèlement sa précision réelle de saisie.

## User Stories

1. En tant qu'Utilisateur avec un chronomètre actif, je veux que le compteur affiche les secondes réellement écoulées, afin qu'il progresse visiblement pendant que je le regarde plutôt que de rester figé jusqu'à la minute suivante.
2. En tant qu'Utilisateur, je veux que ce compteur continue de se mettre à jour tout seul sans action de ma part, comme c'est déjà le cas aujourd'hui.
3. En tant qu'Utilisateur, je veux que la durée de chaque ligne d'Imputation terminée sur la Saisie de temps s'affiche au format `hh:mm:ss`, afin d'avoir la même précision de lecture que sur le compteur en direct.
4. En tant qu'Utilisateur, je veux que le total cumulé d'un groupe (Projet+Activité) sur la Saisie de temps reflète la somme exacte à la seconde près des lignes qui le composent, afin que ce total soit cohérent avec ce que j'observe en dépliant le groupe.
5. En tant qu'Utilisateur, je veux que ce total de groupe dépassant 24h continue de s'afficher sans être plafonné (ex. "27:15:42"), comme c'était déjà le cas en `hh:mm`.
6. En tant qu'Utilisateur consultant un Rapport sur une plage de dates, je veux que les durées par ligne et les totaux (par jour, sur la période) s'affichent au même format `hh:mm:ss` que la Saisie de temps, afin de ne plus jongler entre deux notations différentes ("Xh Ymin" contre `hh:mm`) selon la page consultée.
7. En tant qu'Utilisateur consultant un Rapport, je veux que ses totaux soient calculés à partir des secondes exactes de chaque Imputation plutôt que par somme de minutes déjà arrondies par Imputation, afin d'obtenir un total fidèle même quand de nombreuses Imputations courtes se cumulent.
8. En tant qu'Utilisateur exportant un Rapport en Excel, je veux voir une nouvelle colonne "Durée (hh:mm:ss)" en plus de la colonne minutes existante, afin de lire directement la durée sans calcul mental, tout en gardant la colonne minutes pour d'éventuels usages existants du fichier (macros, tris, calculs).
9. En tant qu'Utilisateur exportant un Rapport en Excel, je veux que cette nouvelle colonne reste un texte simple (ex. "27:15:42"), afin qu'elle s'affiche correctement quels que soient les réglages régionaux de mon Excel et même au-delà de 24h.
10. En tant qu'Utilisateur éditant à la volée l'heure de début ou de fin d'une Imputation terminée, je veux que la saisie reste au format `hh:mm` (comme aujourd'hui), afin de ne pas avoir à taper une précision à la seconde qui n'a pas de sens pour une correction manuelle.
11. En tant qu'Utilisateur, je veux qu'une Imputation éditée manuellement affiche `:00` en secondes après coup, afin que l'affichage reflète honnêtement la précision réelle de ma saisie plutôt que d'inventer une précision qui n'existe pas.
12. En tant que développeur maintenant l'application, je veux un seul formatteur `hh:mm:ss` partagé par tous les affichages du frontend (compteur, lignes, totaux de groupe, Rapport), afin de ne pas dupliquer la logique de zero-padding et de non-plafonnement des heures.
13. En tant que développeur, je veux que le contrat JSON du Rapport (`GET /api/rapports/plage`) porte des champs exprimés en secondes plutôt qu'en minutes, afin que le frontend n'ait pas à deviner une précision perdue côté serveur.

## Implementation Decisions

**Frontend**

- `frontend/src/app/shared/duree.util.ts` : `formatMinutesHHMM` (minute) et `formatMinutes` (texte libre "Xh Ymin") sont retirés, remplacés par un formatteur unique `formatSecondesHHMMSS(totalSecondes: number): string`, zero-paddé sur minutes et secondes, heures non plafonnées (même principe que l'actuel `formatMinutesHHMM`, étendu d'un composant `:ss`). `formatDuree(heureDebut, heureFin)` calcule désormais un nombre de secondes exact (`Math.round((fin - debut) / 1000)`, sans arrondi intermédiaire à la minute) et délègue à `formatSecondesHHMMSS`.
- `frontend/src/app/pages/saisie-temps/saisie-temps.component.ts` :
  - `mettreAJourCompteur()` calcule les secondes écoulées (`Math.floor((Date.now() - heureDebut) / 1000)`) et formate via `formatSecondesHHMMSS` ; l'intervalle de rafraîchissement (`INTERVALLE_COMPTEUR_MS = 1000`) est inchangé, il ne fait déjà que réveiller un calcul qui ignorait jusqu'ici les secondes.
  - `minutesImputation()` devient `secondesImputation()`, calculant les secondes exactes d'une ligne (sans arrondi à la minute) ; `GroupeImputations.totalMinutes` devient `totalSecondes`, alimenté par la somme de ces secondes exactes (et non plus par la somme de minutes déjà arrondies par ligne).
  - Le template (`saisie-temps.component.html`) affiche `formatDuree(...)` par ligne (inchangé dans son usage, change de résultat) et `formatSecondesHHMMSS(groupe.totalSecondes)` pour le total de groupe (`data-testid="groupe-total"`), à la place de `formatMinutesHHMM(groupe.totalMinutes)`.
- `frontend/src/app/pages/rapport/rapport.component.ts` / `.html` : l'import de `formatMinutes` est remplacé par `formatSecondesHHMMSS`. `GroupeJour.totalMinutes` devient `totalSecondes`, calculé à partir de `RapportLigne.dureeSecondes`. Les trois usages du template (`rapport-total`, badge de total par jour, badge par ligne) appellent `formatSecondesHHMMSS` sur les champs renommés.
- `frontend/src/app/models/imputation.ts` : `RapportLigne.dureeMinutes` → `dureeSecondes`, `Rapport.totalMinutes` → `totalSecondes`. Aucun autre champ du modèle `Imputation` ne change (`heureDebut`/`heureFin` restent des chaînes ISO, aucune Durée n'y est jamais persistée).
- `frontend/src/app/services/rapport.service.ts` : aucun changement de logique, les types suivent le renommage du modèle.
- L'édition à la volée (`construireHeureEditee`, `demarrerEdition`) n'est pas modifiée : elle continue de fixer les secondes à `0` (`reference.setHours(heures, minutes, 0, 0)`), ce qui produit naturellement des Durées affichées avec `:00` de secondes pour toute Imputation éditée manuellement.

**Backend**

- `backend/src/services/reporting.js` : le helper `dureeMinutes(imputation)` devient `dureeSecondes(imputation)` (`Math.round((fin - debut) / 1000)`, sans passer par un arrondi minute intermédiaire). `calculerSyntheseJournaliere` et `calculerRapportPlage` accumulent `dureeSecondes` par ligne/groupe et exposent `totalSecondes` au lieu de `totalMinutes`. Les deux fonctions partagent ce même helper : `GET /rapports/journalier` (déjà non appelée par le frontend depuis la précédente spec) suit mécaniquement le même renommage, sans décision ni effort supplémentaire dédié à cette route.
- `backend/src/routes/rapports.routes.js` : aucun changement de routes ou de paramètres, seule la forme du JSON renvoyé par `/journalier` et `/plage` change (champs renommés en secondes) en conséquence du point précédent.
- `backend/src/services/excelExport.js` : la colonne existante `{ header: 'Durée (minutes)', key: 'dureeMinutes' }` est conservée mais dérivée de la nouvelle donnée (`Math.round(ligne.dureeSecondes / 60)`, calculée au moment de construire la feuille, sans changer l'arrondi visible de cette colonne). Une nouvelle colonne `{ header: 'Durée (hh:mm:ss)', key: 'dureeFormatee' }` est ajoutée, remplie par un petit formatteur local au backend (même principe de zero-padding et de non-plafonnement des heures que le frontend — logique dupliquée intentionnellement, les deux runtimes n'ont pas de module partagé aujourd'hui) appliqué à `ligne.dureeSecondes`.
- Aucun changement de schéma sur `Imputation` (`backend/src/models/Imputation.js`) : `heureDebut`/`heureFin` restent des `Date` complètes, aucune Durée n'est persistée, elle reste toujours dérivée au moment du calcul.

## Testing Decisions

Principe général inchangé : tester le comportement externe (contrat HTTP côté backend, état/API publique du composant côté frontend, sortie du formatteur en test unitaire pur), pas les détails d'implémentation internes.

**Frontend** (`duree.util.spec.ts`, à réécrire pour la nouvelle API) :

- `formatSecondesHHMMSS` : zero-padding des secondes et des minutes sous 10 (ex. 5 secondes → "00:00:05"), valeur pile sur la minute, valeur pile sur l'heure, valeur au-delà d'une heure, valeur au-delà de 24h non plafonnée (ex. "27:15:42").
- `formatDuree` : calcule bien un écart en secondes exact (pas d'arrondi à la minute), y compris pour un écart de quelques secondes seulement.

**Frontend** (`saisie-temps.component.spec.ts`, à étendre — pattern `fakeAsync`/`tick` déjà en place) :

- Compteur en direct : avancer le temps simulé de quelques secondes (pas seulement des minutes entières) et vérifier que la valeur affichée progresse seconde par seconde.
- Regroupement : à partir de lignes dont les durées individuelles ne sont pas des multiples exacts de la minute (ex. deux Imputations de 30 secondes chacune), vérifier que le total de groupe reflète la somme exacte des secondes (`01:00` et non `00:00` ou `00:02` selon l'arrondi par ligne qui aurait été appliqué avant sommation) et s'affiche en `hh:mm:ss`.

**Backend** (`backend/test/`, pattern supertest existant) :

- `rapportPlage.test.js` et `rapportJournalier.test.js` : les assertions sur `totalMinutes`/`dureeMinutes` sont mises à jour vers `totalSecondes`/`dureeSecondes` (valeurs multipliées par 60 pour les cas existants), et un nouveau cas ajoute des Imputations dont la durée n'est pas un multiple exact de la minute pour vérifier que l'agrégation ne perd pas de précision par un arrondi prématuré par Imputation.
- `exportExcel.test.js` : l'entête attendue (`feuille.getRow(1).values`) inclut désormais `'Durée (hh:mm:ss)'` en plus de `'Durée (minutes)'` ; les valeurs de la ligne de données vérifient à la fois la colonne minutes (inchangée dans son calcul visible) et la nouvelle colonne texte formatée.

**Frontend** (`rapport.component.spec.ts`, à étendre — pattern `HttpTestingController` déjà en place) :

- Les payloads simulés (`flush`) utilisent désormais `dureeSecondes`/`totalSecondes` ; les assertions vérifient que le composant expose ces champs renommés et que le gabarit affiche la valeur au format `hh:mm:ss` (via `data-testid="rapport-total"` déjà présent).

## Out of Scope

- Ajout d'un champ secondes à la saisie manuelle des heures de début/fin (édition à la volée) : elle reste au format `hh:mm`, les Imputations éditées manuellement afficheront toujours `:00` en secondes.
- Suppression ou dépréciation de la route backend `GET /rapports/journalier` : elle continue d'exister et suit mécaniquement le renommage de champs, sans que sa suppression soit traitée par cette spec (déjà hors périmètre de la spec précédente).
- Passage de la colonne Excel "Durée (minutes)" à une véritable cellule de type Durée/Heure Excel : la nouvelle colonne reste un texte brut, la colonne minutes existante n'est pas retypée non plus.
- Tout changement du modèle de données `Imputation` ou de la précision de stockage de `heureDebut`/`heureFin` (déjà des `Date` complètes, aucun changement nécessaire).
- Tout mécanisme permettant à l'Utilisateur de choisir ou configurer le format d'affichage des durées (le format `hh:mm:ss` devient le seul format, comme `hh:mm` l'était avant lui).

## Further Notes

- Le glossaire `CONTEXT.md` a été mis à jour pendant la spécification avec un nouveau terme **Durée**, qui documente explicitement cette asymétrie de précision (seconde exacte pour une Imputation issue d'un chronomètre, minute avec secondes à zéro pour une Imputation saisie/éditée manuellement) — vocabulaire à réutiliser tel quel dans le code et les tests. C'est un comportement attendu du domaine, pas un bug à corriger.
- Aucune ADR n'a été créée pour ce changement : il reste facilement réversible et ne résulte pas d'un arbitrage architectural (juste un changement de précision d'affichage et de calcul, cohérent avec l'esprit du formatteur unique déjà introduit par la spec précédente).
- Cette spec est un complément direct de `.scratch/ameliorations-saisie-temps/` (notamment les ticket 03 "Format hh:mm pour toutes les durées" et 04 "Compteur en direct") : elle en étend le principe aux secondes plutôt que de le remettre en cause.
