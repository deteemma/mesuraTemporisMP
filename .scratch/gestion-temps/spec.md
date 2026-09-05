# Gestion du temps consommé sur un projet

Status: ready-for-agent

## Problem Statement

Une équipe a besoin de suivre le temps que chacun de ses membres consacre aux différents projets sur lesquels elle travaille. Aujourd'hui, rien n'existe : il n'y a aucun outil pour démarrer un suivi de temps, l'imputer à un projet ou une activité précise, ni pour en tirer une synthèse exploitable (par journée, par projet, par membre de l'équipe).

## Solution

Une application client/serveur (MEAN — MongoDB, Express, Angular, Node) où :

- un Administrateur gère les comptes Utilisateur, les Projets et leurs équipes (affectation d'Utilisateurs), ainsi que les Activités de chaque Projet ;
- chaque Utilisateur affecté à un Projet peut imputer du temps sur une Activité de ce Projet, via un chronomètre démarré/arrêté en direct ou via une saisie manuelle d'heure de début/fin ;
- une synthèse du temps imputé (par Utilisateur, Projet, Activité, Journée) est visible sur la même page que la saisie en cours, et exportable en Excel sur une plage de dates choisie.

## User Stories

1. En tant qu'Administrateur, je veux qu'un compte `admin`/`admin` soit créé automatiquement à l'installation, afin de pouvoir me connecter dès le premier démarrage sans configuration préalable.
2. En tant qu'Administrateur, je veux être obligé de changer le mot de passe du compte admin à la première connexion, afin que l'identifiant par défaut ne reste pas actif.
3. En tant qu'Administrateur, je veux créer des comptes Utilisateur (login, nom), afin que les membres de l'équipe puissent accéder à l'application.
4. En tant que nouvel Utilisateur, je veux recevoir un mot de passe temporaire identique à mon login, afin de pouvoir me connecter la première fois.
5. En tant qu'Utilisateur (nouveau ou admin), je veux être obligé de changer mon mot de passe à ma première connexion, afin qu'aucune autre personne ne puisse réutiliser l'identifiant temporaire.
6. En tant qu'Administrateur, je veux me connecter avec des droits élevés, afin de gérer les Utilisateurs, Projets, Activités, et de consulter tous les rapports.
7. En tant qu'Utilisateur, je veux me connecter avec mon login/mot de passe, afin d'accéder uniquement à mes propres données et aux Projets sur lesquels je suis affecté.
8. En tant qu'Administrateur, je veux supprimer un Utilisateur, afin qu'un ancien membre de l'équipe perde l'accès à l'application.
9. En tant qu'Administrateur, je veux que la suppression d'un Utilisateur supprime en cascade toutes ses Imputations, afin que l'historique reste cohérent avec la règle de suppression en cascade du modèle.
10. En tant qu'Administrateur, je veux créer un Projet, afin de pouvoir suivre le temps consommé sur un nouveau travail.
11. En tant qu'Administrateur, je veux qu'un Projet nouvellement créé ait un statut "actif" par défaut, afin qu'il soit immédiatement utilisable.
12. En tant qu'Administrateur, je veux affecter un ou plusieurs Utilisateurs à un Projet, afin que seuls les membres de son équipe puissent y imputer du temps.
13. En tant qu'Administrateur, je veux retirer un Utilisateur d'un Projet, afin qu'il ne puisse plus y créer de nouvelles Imputations (ses Imputations passées sur ce Projet restent en base tant que ni le Projet, ni l'Utilisateur, ni l'Activité concernée n'est supprimé).
14. En tant qu'Administrateur, je veux supprimer un Projet, afin que celui-ci, ses Activités, et toutes les Imputations qui s'y rattachent disparaissent en cascade.
15. En tant qu'Utilisateur affecté à un Projet, je veux voir la liste des Projets sur lesquels je suis affecté, afin de choisir où imputer mon temps.
16. En tant qu'Utilisateur affecté à un Projet, je veux créer une nouvelle Activité à la volée au moment où je démarre un chronomètre, afin de ne pas dépendre d'un Administrateur pour chaque nouvelle tâche.
17. En tant qu'Administrateur, je veux créer/renommer/supprimer des Activités au sein d'un Projet, afin de pouvoir organiser et nettoyer le découpage du travail.
18. En tant qu'Administrateur, je veux que la suppression d'une Activité supprime en cascade toutes les Imputations qui s'y rattachent, afin que l'historique reste cohérent.
19. En tant qu'Utilisateur, je veux démarrer un chronomètre sur une Activité, afin que le temps soit enregistré automatiquement pendant que je travaille.
20. En tant qu'Utilisateur, je veux ne pouvoir avoir qu'un seul chronomètre actif à la fois (le serveur refuse le démarrage d'un second si un premier est déjà ouvert), afin d'éviter des incohérences de suivi.
21. En tant qu'Utilisateur, je veux arrêter mon chronomètre en cours, afin que l'Imputation reçoive une heure de fin et soit comptée dans le total journalier.
22. En tant qu'Utilisateur, je veux saisir manuellement une Imputation (heure de début et de fin), afin de ne pas perdre le suivi d'un temps de travail pour lequel je n'ai pas démarré de chronomètre.
23. En tant qu'Utilisateur, je veux pouvoir modifier l'heure de début ou de fin de n'importe laquelle de mes Imputations à tout moment, afin de corriger une erreur rétroactivement.
24. En tant qu'Utilisateur, je veux pouvoir créer des Imputations qui se chevauchent sans être bloqué, afin que l'application ne m'empêche pas de saisir des cas légitimes (ex. interruption courte).
25. En tant qu'Utilisateur, je veux pouvoir supprimer une de mes Imputations, afin de retirer complètement une saisie erronée.
26. En tant qu'Administrateur, je veux pouvoir modifier ou supprimer l'Imputation de n'importe quel Utilisateur, afin de pouvoir corriger les données de l'équipe si besoin.
27. En tant qu'Utilisateur, je veux voir une synthèse journalière de mon temps imputé, regroupée par Projet et par Activité et calculée uniquement à partir des Imputations terminées, afin que le total reflète le travail effectivement clos.
28. En tant qu'Utilisateur, je veux que cette synthèse journalière soit affichée sur la même page que ma saisie en cours, afin de suivre ma progression pendant que je travaille.
29. En tant qu'Utilisateur, je veux choisir une plage de dates et obtenir un rapport de synthèse (par Utilisateur, Projet, Activité, Journée) sur cette période, afin de comprendre comment mon temps a été réparti.
30. En tant qu'Utilisateur, je veux exporter ce rapport en Excel, afin de pouvoir le partager ou l'archiver en dehors de l'application.
31. En tant qu'Utilisateur, je veux ne voir/exporter que mes propres Imputations dans les rapports, afin que ma visibilité reste limitée à mon propre travail.
32. En tant qu'Administrateur, je veux disposer du même rapport/export mais portant sur tous les Utilisateurs et tous les Projets, afin d'avoir une visibilité complète sur le temps de l'équipe.

## Implementation Decisions

- **Modules backend (Express + MongoDB/Mongoose)** : module Auth (login, session JWT, drapeau "doit changer son mot de passe"), module Utilisateur (CRUD, rôle utilisateur|administrateur), module Projet (CRUD, liste d'Utilisateurs affectés, statut par défaut "actif" non exploité pour l'instant), module Activité (CRUD, rattachée à un Projet), module Imputation (création via démarrage/arrêt de chronomètre ou saisie manuelle, modification, suppression), module Reporting (agrégation par plage de dates + regroupement Utilisateur/Projet/Activité/Journée, export Excel).
- **Modules frontend (Angular)** : écrans de connexion + changement de mot de passe obligatoire ; écrans Administrateur (gestion Utilisateurs, gestion Projets + affectation d'équipe, gestion des Activités d'un Projet) ; écran de saisie de temps combinant contrôle du chronomètre, formulaire de saisie manuelle, et synthèse journalière sur la même page ; écran de rapport avec sélecteur de plage de dates, tableau de synthèse, et bouton d'export Excel.
- **Modèle de données (conceptuel)** :
  - Utilisateur : login (unique), mot de passe (haché), rôle (utilisateur | administrateur), doitChangerMotDePasse (booléen)
  - Projet : nom, statut (défaut "actif"), utilisateursAffectes (liste de références Utilisateur)
  - Activité : nom, projetId (référence)
  - Imputation : utilisateurId, projetId, activiteId, heureDebut, heureFin (nul tant que le chronomètre est en cours)
- **Contrat API** : routes REST sous `/api`, authentification par jeton JWT (sauf login), middleware de contrôle de rôle sur les routes réservées à l'Administrateur (CRUD Utilisateur, CRUD Projet, CRUD/suppression Activité), middleware de contrôle de propriété sur la modification/suppression d'Imputation (propriétaire ou Administrateur uniquement), portée de lecture forcée côté serveur sur les routes de reporting (Utilisateur → ses propres Imputations uniquement ; Administrateur → toutes).
- **Authentification** : JWT + mot de passe haché (bcrypt ou équivalent). Amorçage : au premier démarrage, si aucun Utilisateur n'existe en base, création automatique du compte `admin`/`admin` (voir ADR 0001). Tout nouveau compte Utilisateur créé par l'Administrateur reçoit un mot de passe temporaire égal à son login, avec le même mécanisme de changement obligatoire à la première connexion.
- **Mécanique du chronomètre** : démarrer un chronomètre crée une Imputation avec `heureDebut = maintenant` et `heureFin = null`. Le serveur refuse le démarrage si l'Utilisateur a déjà une Imputation ouverte (`heureFin = null`), quel que soit le Projet/Activité — la règle "un seul chronomètre actif" est appliquée côté serveur, pas seulement dans l'interface.
- **Calcul journalier** : effectué côté serveur, somme des durées (`heureFin - heureDebut`) regroupées par jour/Projet/Activité, en excluant toute Imputation dont `heureFin` est nul.
- **Suppression en cascade** : implémentée au niveau du service applicatif (pas nécessairement une cascade native MongoDB) — la suppression d'un Utilisateur, d'un Projet, ou d'une Activité supprime toutes les Imputations qui y font référence.
- **Reporting/export** : paramètres de plage de dates (dateDebut, dateFin), regroupement par Utilisateur/Projet/Activité/Journée, route d'export générant un fichier `.xlsx` (ex. bibliothèque `exceljs`).

## Testing Decisions

- Un bon test vérifie un comportement observable depuis l'extérieur du module (réponse HTTP, état persisté relisible via l'API) — jamais un détail d'implémentation interne (structure d'un document Mongoose, appel de telle fonction de service).
- **Backend** : tests d'intégration via `supertest` contre l'application Express, avec une vraie base MongoDB de test (`mongodb-memory-server`, réinitialisée entre chaque test). Aucun test n'appelle directement les couches service/repository — tout passe par l'API HTTP. À couvrir : création automatique du compte admin au premier démarrage, application du changement de mot de passe obligatoire, contrôle d'accès par rôle (403 sur les routes Administrateur pour un Utilisateur normal), CRUD Projet/Activité + affectation, création d'Imputation (démarrage/arrêt de chronomètre, saisie manuelle), refus d'un second chronomètre actif, chevauchement autorisé, droits de modification/suppression (propriétaire, Administrateur, refus pour un tiers), suppression en cascade, calcul journalier excluant les Imputations ouvertes, reporting par plage de dates avec regroupement correct, portée de visibilité (propre vs totale), export Excel produisant un fichier valide avec les lignes attendues.
- **Frontend** : tests de composants/services Angular via `TestBed` + `HttpClientTestingModule` (appels HTTP simulés, pas de vrai backend). À couvrir : transitions d'état du chronomètre (démarrage/arrêt, bouton désactivé si déjà actif), validation du formulaire de saisie manuelle, affichage de la synthèse journalière, sélecteur de plage de dates et déclenchement de l'export.
- **Prior art** : aucun — c'est la première fonctionnalité de ce dépôt, elle établit le patron de test (coutures, structure) que les tickets suivants réutiliseront.

## Out of Scope

- Cycle de vie/statuts d'un Projet au-delà du statut "actif" par défaut (pas d'archivage/clôture appliqué)
- Budget ou temps estimé par Projet ou Activité (pur journal de temps, sans comparaison à un budget)
- Workflow de validation/clôture verrouillant les Imputations (elles restent toujours modifiables)
- Rôle "chef de projet" à portée locale (l'Administrateur reste global pour l'instant)
- Auto-inscription des comptes Utilisateur
- Notifications/alertes
- Internationalisation/multi-langue
- Catalogue d'Activités réutilisable entre plusieurs Projets

## Further Notes

- Le vocabulaire utilisé ici (Utilisateur, Administrateur, Projet, Activité, Imputation) est celui défini dans `CONTEXT.md` — à respecter dans le découpage en tickets et l'implémentation.
- La décision du compte admin de bootstrap est tracée dans `docs/adr/0001-default-admin-bootstrap-account.md` ; toute implémentation qui s'en écarte doit le signaler explicitement.
- Cette spec couvre l'intégralité du MVP fonctionnel (auth, gestion Utilisateur/Projet/Activité, Imputation via chronomètre et saisie manuelle, reporting/export) — `/to-tickets` la découpera en tickets tracer-bullet avec leurs dépendances.
