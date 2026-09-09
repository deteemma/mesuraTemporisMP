Status: ready-for-agent

# Améliorations de la page Saisie de temps

## Problem Statement

Sur la page de saisie de temps, l'Utilisateur perd du temps et de la précision dans plusieurs situations quotidiennes :

- Les durées affichées ("2 h 15", "45 min") demandent une conversion mentale au lieu d'une lecture directe en heures/minutes.
- Quand un chronomètre est actif, l'Utilisateur ne voit que l'heure de départ, pas le temps déjà écoulé — il doit calculer lui-même.
- Corriger une heure de début ou de fin après coup nécessite un formulaire séparé, pas une correction rapide directement sur la ligne.
- Reprendre une activité déjà faite dans la journée (même Projet, même Activité) oblige à ressaisir manuellement Projet et Activité pour redémarrer un chronomètre.
- La liste des imputations terminées d'une journée est une liste plate : additionner le temps passé sur un même Projet+Activité se fait à la main.

## Solution

- Toutes les durées (ligne, sous-total de groupe, total) s'affichent au format `hh:mm`, sans plafond à 24h (un cumul peut dépasser 24h car les Imputations peuvent se chevaucher — voir glossaire).
- La ligne du chronomètre actif affiche à la fois l'heure de départ et un compteur `hh:mm` du temps écoulé, mis à jour en continu.
- Chaque ligne d'Imputation terminée permet l'édition à la volée de son heure de début et de fin (clic direct sur l'heure). Si l'édition ferait franchir minuit à l'Imputation, elle est automatiquement scindée en deux Imputations consécutives plutôt que rejetée (voir ADR 0003 et le terme **Scission** dans CONTEXT.md).
- Chaque ligne d'Imputation terminée porte un bouton "relancer" qui démarre un nouveau chronomètre avec le même Projet et la même Activité que cette ligne, en arrêtant automatiquement le chronomètre actif s'il y en a un.
- Le bloc des imputations terminées regroupe les lignes d'une journée par Projet+Activité, repliées par défaut, avec un total cumulé par groupe ; le bloc "synthèse" séparé, devenu redondant, est retiré.

## User Stories

1. En tant qu'Utilisateur, je veux voir toutes les durées au format `hh:mm`, afin de les lire directement sans conversion mentale depuis un format texte libre.
2. En tant qu'Utilisateur, je veux que ce format soit le même partout sur la page (ligne, sous-total de groupe, total), afin de ne pas jongler entre plusieurs notations à l'écran.
3. En tant qu'Utilisateur, je veux qu'un total cumulé dépassant 24h (à cause d'Imputations qui se chevauchent) s'affiche sans être plafonné (ex. "27:15"), afin que le total reflète fidèlement la réalité sans masquer un chevauchement.
4. En tant qu'Utilisateur avec un chronomètre actif, je veux voir à la fois l'heure de départ et un compteur du temps écoulé en `hh:mm`, afin de savoir quand j'ai commencé et depuis combien de temps je travaille.
5. En tant qu'Utilisateur, je veux que ce compteur se mette à jour tout seul, afin de pouvoir le consulter à tout moment sans rafraîchir la page.
6. En tant qu'Utilisateur, je veux pouvoir cliquer directement sur l'heure de début ou de fin d'une Imputation terminée pour la modifier, afin de corriger rapidement une erreur sans ouvrir un formulaire séparé.
7. En tant qu'Utilisateur, je veux que ma modification se valide automatiquement (Entrée ou perte de focus), afin que la correction soit immédiate.
8. En tant qu'Utilisateur, je veux pouvoir annuler une édition en cours avec Échap, afin de revenir en arrière sans effet de bord si je me suis trompé.
9. En tant qu'Utilisateur, je veux que l'édition à la volée ne soit disponible que sur les Imputations terminées, afin que l'Imputation en cours reste pilotée uniquement par démarrer/arrêter le chronomètre.
10. En tant qu'Utilisateur, si mon édition ferait franchir minuit à l'Imputation, je veux qu'elle soit automatiquement scindée en deux Imputations consécutives plutôt que rejetée, afin que mon activité réelle (qui a duré à cheval sur minuit) reste enregistrée sans ressaisie manuelle.
11. En tant qu'Utilisateur, je veux que ce comportement de scission fonctionne aussi bien en éditant l'heure de début (vers la veille) que l'heure de fin (vers le lendemain), afin que les deux sens d'une même erreur de saisie soient traités de façon cohérente.
12. En tant qu'Utilisateur, je veux être informé par un message court lorsqu'une édition a provoqué une scission, précisant le jour où la nouvelle Imputation a été créée, afin de comprendre pourquoi une seconde ligne est apparue alors que je n'ai modifié qu'une heure.
13. En tant qu'Utilisateur, je ne veux pas de confirmation bloquante avant qu'une scission ait lieu, afin que mes éditions à la volée restent rapides.
14. En tant qu'Utilisateur, je veux que la scission soit une opération tout-ou-rien, afin de ne jamais me retrouver avec une Imputation tronquée sans que la nouvelle ait été créée à cause d'un problème réseau.
15. En tant qu'Utilisateur, je veux un bouton "relancer" sur chaque ligne d'Imputation terminée, afin de reprendre rapidement le même type de travail sans resélectionner Projet et Activité.
16. En tant qu'Utilisateur, je veux qu'un clic sur "relancer" démarre un nouveau chronomètre avec le même Projet et la même Activité que la ligne, afin de ne pas répéter une sélection manuelle pour une tâche que je reprends.
17. En tant qu'Utilisateur, si un chronomètre est déjà actif quand je clique sur "relancer" une autre ligne, je veux que le chronomètre actif soit arrêté automatiquement et le nouveau démarré à sa place, afin de ne pas devoir arrêter puis démarrer manuellement.
18. En tant qu'Utilisateur, je veux être informé par un message lorsque "relancer" a arrêté automatiquement un chronomètre précédent, afin de savoir précisément quand le temps de l'activité précédente s'est arrêté.
19. En tant qu'Utilisateur, je veux que le bouton "relancer" soit désactivé sur une ligne dont le Projet+Activité correspond déjà à mon chronomètre actif, afin de ne pas déclencher un arrêt-puis-redémarrage inutile de la même chose.
20. En tant qu'Utilisateur, je veux que les Imputations terminées d'une journée soient regroupées par Projet et Activité, afin de voir d'un coup d'œil le temps passé sur chacun sans faire l'addition moi-même.
21. En tant qu'Utilisateur, je veux que chaque groupe affiche un total cumulé en `hh:mm` et le nombre de lignes qu'il contient, afin d'avoir le résumé sans avoir à le déplier.
22. En tant qu'Utilisateur, je veux que les groupes soient repliés par défaut, afin que ma liste de la journée reste compacte et facile à parcourir.
23. En tant qu'Utilisateur, je veux pouvoir déplier un groupe pour voir ses Imputations individuelles (avec leurs heures, l'édition à la volée, la suppression et le bouton relancer toujours disponibles), afin de pouvoir agir sur une ligne précise quand j'en ai besoin.
24. En tant qu'Utilisateur, je n'ai pas besoin que mes groupes dépliés soient mémorisés d'un rechargement à l'autre, afin que la liste reparte toujours dans un état compact et prévisible.
25. En tant qu'Utilisateur, je veux que les groupes soient ordonnés selon l'heure de démarrage de leur première Imputation, afin que la liste reflète toujours le déroulé chronologique réel de ma journée.
26. En tant qu'Utilisateur, je ne veux plus voir un bloc "synthèse" séparé qui affiche les mêmes totaux Projet+Activité en double, afin de ne pas voir deux fois la même information à l'écran.

## Implementation Decisions

**Backend**

- Aucun changement de schéma sur `Imputation` (`backend/src/models/Imputation.js`) : toujours `utilisateurId`, `projetId`, `activiteId`, `heureDebut`, `heureFin` (`null` = en cours). Aucune durée n'est persistée, elle reste toujours dérivée.
- `PATCH /imputations/:id` (`backend/src/routes/imputations.routes.js`) est étendu, pas remplacé : accepte toujours `{ heureDebut?, heureFin? }`. Nouveau comportement : si l'édition ferait franchir un jour calendaire (comparaison sur la même convention de journée UTC déjà utilisée ailleurs dans le code, ex. `T00:00:00.000Z` / `T23:59:59.999Z`), l'opération devient une **Scission** atomique au lieu d'une simple mise à jour : l'Imputation d'origine est tronquée à la borne du jour touchée, une nouvelle Imputation est créée pour le même `utilisateurId`/`projetId`/`activiteId` à partir de la borne opposée jusqu'à l'heure visée par l'édition. Les deux écritures sont effectuées dans une même transaction (ou opération atomique équivalente) : jamais l'une sans l'autre.
- La réponse de `PATCH /imputations/:id` porte une information permettant au frontend de distinguer une édition simple d'une Scission (ex. un champ indiquant si une scission a eu lieu et, le cas échéant, l'Imputation nouvellement créée). Le nom exact des champs est laissé à l'agent d'implémentation, en cohérence avec les conventions déjà en place dans `backend/src/serializers.js`.
- `POST /imputations/chrono/start` est modifié : il ne renvoie plus 409 quand l'Utilisateur a déjà une Imputation en cours. Il arrête automatiquement celle-ci (`heureFin: new Date()`) et démarre la nouvelle, dans une même transaction atomique — une seule requête HTTP pour les deux écritures. La réponse porte une information permettant de distinguer un démarrage simple d'un démarrage ayant arrêté un chronomètre précédent (même logique de discriminant que pour la Scission).
- `GET /rapports/journalier` (`backend/src/routes/rapports.routes.js`) et `calculerSyntheseJournaliere` (`backend/src/services/reporting.js`) ne sont pas supprimés : seule la page Saisie de temps arrête de les appeler. La suppression éventuelle de cette route est une décision distincte, hors périmètre (voir Out of Scope).
- Aucun changement sur `POST /imputations` (création manuelle), `DELETE /imputations/:id`, `GET /imputations`, ni sur les modèles `Activite`/`Projet`.

**Frontend**

- `frontend/src/app/shared/duree.util.ts` : le formatage de durée devient un formatteur unique `hh:mm`, zero-paddé, non plafonné, utilisé partout (ligne, sous-total de groupe, compteur en direct). Les formats texte libres actuels ("2 h 15", "45 min", "en cours") sont retirés au profit de ce formatteur unique.
- `frontend/src/app/pages/saisie-temps/saisie-temps.component.ts` / `.html` :
  - Bloc chrono actif : affiche l'heure de départ existante **et** un compteur du temps écoulé, recalculé à intervalle régulier, formaté via le formatteur `hh:mm`.
  - Liste des imputations terminées : remplace la boucle plate actuelle par une structure dérivée regroupant les Imputations du jour par couple (`projetId`, `activiteId`) — chaque groupe portant ses lignes, son total cumulé en minutes, et un état déplié/replié local au composant (non persisté, replié par défaut). Groupes ordonnés par l'heure de départ la plus ancienne parmi leurs lignes.
  - Chaque ligne dans un groupe déplié garde la suppression existante, gagne l'édition à la volée (clic → champ → Entrée/blur enregistre via `ImputationService.modifier()`, qui doit désormais exposer le discriminant de scission renvoyé par `PATCH` pour déclencher la notification) et le bouton "relancer" (appelle le démarrage de chrono avec `projetId`/`activiteId` de la ligne ; désactivé si le chrono actif correspond déjà à ce couple).
  - Le bloc "synthèse" et son appel à `RapportService.syntheseJournaliere` sont retirés du composant.
- `frontend/src/app/services/imputation.service.ts` : le type de retour de `modifier()` reflète la nouvelle forme de réponse du `PATCH` (Imputation + information de scission optionnelle). Le service de démarrage de chrono reflète de même la nouvelle forme de réponse du `POST /chrono/start` (Imputation démarrée + information optionnelle sur le chrono précédent arrêté).
- Notifications : vérifier s'il existe déjà un composant de notification/toast partagé dans le système de design maison (ADR 0002) ; sinon, en introduire un minimal cohérent avec les tokens SCSS existants — pas de librairie tierce.

## Testing Decisions

Principe général : tester le comportement externe (contrat HTTP côté backend, état/API publique du composant côté frontend), pas les détails d'implémentation internes — conforme aux conventions déjà en place dans ce dépôt.

**Backend** (`backend/test/`, intégration via supertest + mongodb-memory-server, app Express réelle — pattern déjà utilisé dans `imputations.test.js`/`chrono.test.js`) :

- `imputations.test.js`, à étendre :
  - Édition ne franchissant pas minuit : mise à jour normale, pas d'information de scission dans la réponse.
  - Édition de `heureFin` franchissant minuit vers l'avant : l'Imputation d'origine est tronquée à la borne du jour, une nouvelle Imputation est créée le lendemain avec le bon `projetId`/`activiteId`/`utilisateurId` et l'heure de fin visée ; la réponse porte les deux.
  - Cas symétrique en éditant `heureDebut` vers la veille.
  - Les contrôles d'autorisation existants (propriétaire ou Administrateur) restent appliqués sur ce chemin d'édition qui déclenche une scission.
- `chrono.test.js`, à étendre :
  - `POST /chrono/start` sans chrono actif : comportement inchangé.
  - `POST /chrono/start` avec un chrono déjà actif : le 409 n'a plus lieu ; l'Imputation précédemment active est fermée (`heureFin` récente) et une nouvelle est ouverte avec le nouveau `projetId`/`activiteId` ; la réponse porte les deux informations.

**Frontend** (`saisie-temps.component.spec.ts`, à étendre — TestBed + `HttpClientTestingModule`/`HttpTestingController`, `fakeAsync`/`tick` pour le compteur, pattern déjà en place dans ce fichier) :

- Compteur en direct : après avoir simulé la réponse de statut de chrono actif, avancer le temps simulé et vérifier que la valeur écoulée exposée par le composant se met à jour, au format `hh:mm`.
- Édition à la volée : simuler l'édition, vérifier la mise à jour de l'état de la liste sur une réponse `PATCH` normale ; vérifier qu'une notification est déclenchée sur une réponse `PATCH` portant une scission, et que la ligne créée sur l'autre jour n'apparaît pas dans la vue (toujours limitée à un seul jour).
- Relancer : vérifier que l'action déclenche l'appel de démarrage de chrono avec le `projetId`/`activiteId` de la ligne ; vérifier l'état désactivé du bouton quand le chrono actif correspond déjà à cette ligne.
- Regroupement : à partir d'une liste d'Imputations d'un jour, vérifier que le regroupement par `projetId`+`activiteId` est correct, que les totaux cumulés sont exacts (y compris un cas dépassant 24h), que l'état par défaut est replié, et que le bascule déplié/replié fonctionne par groupe.
- Vérifier qu'aucune requête vers `/rapports/journalier` n'est plus émise par ce composant.

**Frontend** (`duree.util.spec.ts`, nouveau fichier, tests unitaires purs) :

- Zero-padding des heures et des minutes pour les petites valeurs (ex. 5 minutes → "00:05").
- Valeurs sous l'heure, au-delà d'une heure, et au-delà de 24h (non plafonné) correctement formatées.

## Out of Scope

- Vue multi-jours pour le bloc des imputations terminées (le regroupement reste sur le seul jour actuellement affiché).
- Prise en compte du fuseau horaire client pour les bornes de journée (la convention UTC déjà utilisée dans le code est réutilisée telle quelle pour la Scission ; un passage à un jour calendaire local au client est un sujet préexistant, distinct de cette spec).
- Suppression ou dépréciation de la route backend `GET /rapports/journalier` : seule la page Saisie de temps arrête de l'appeler.
- Modifications du formulaire de saisie manuelle (`datetime-local`, date+heure complètes) — non concerné par l'éditeur à la volée hh:mm.
- Tout mécanisme de confirmation ou d'annulation ("undo") d'une scission ou d'un arrêt automatique de chrono, au-delà de la notification.
- Mémorisation de l'état déplié/replié entre sessions ou appareils.
- Tri des groupes autre que chronologique par première occurrence (pas de tri configurable par l'utilisateur).
- Tout ajout de champ de durée persisté sur le modèle Imputation.

## Further Notes

- L'ADR [0003-scission-automatique-des-imputations-a-minuit.md](../../docs/adr/0003-scission-automatique-des-imputations-a-minuit.md) documente le raisonnement derrière la Scission — à lire avant l'implémentation.
- Le glossaire `CONTEXT.md` a été mis à jour pendant la spécification (règle du chronomètre unique par Utilisateur, invariant "une Imputation tient dans une seule journée", nouveau terme **Scission**) — vocabulaire à utiliser tel quel dans le code et les tests.
- Le système de design est maison (ADR 0002) : ne pas introduire Angular Material ou une autre librairie de composants pour les groupes repliables ou la notification/toast.
