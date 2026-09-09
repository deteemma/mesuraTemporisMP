# 07: Bouton "relancer" avec arrêt automatique du chrono actif

**What to build:** chaque ligne d'Imputation terminée porte un bouton "relancer" qui démarre un nouveau chronomètre avec le même Projet et la même Activité que la ligne, en arrêtant automatiquement le chronomètre actif s'il y en a un.

**Blocked by:** 01 (transaction Mongoose), 02 (notification)

**Status:** ready-for-agent

- [ ] `POST /imputations/chrono/start` ne renvoie plus 409 quand l'Utilisateur a déjà une Imputation en cours : il arrête automatiquement celle-ci (`heureFin: maintenant`) et démarre la nouvelle, dans une transaction (ticket 01).
- [ ] La réponse indique si un chrono précédent a été arrêté automatiquement, avec ses informations.
- [ ] Chaque ligne d'Imputation terminée porte un bouton "relancer" qui démarre un nouveau chronomètre avec le `projetId`/`activiteId` de cette ligne.
- [ ] Une notification (composant du ticket 02) informe l'Utilisateur quand un chrono précédent a été arrêté automatiquement par cette action.
- [ ] Le bouton "relancer" est désactivé sur une ligne dont le `projetId`+`activiteId` correspond déjà au chrono actuellement actif.
- [ ] `backend/test/chrono.test.js` couvre : démarrage sans chrono actif (inchangé), démarrage avec un chrono déjà actif (fermeture de l'ancien + ouverture du nouveau, plus de 409).
- [ ] `saisie-temps.component.spec.ts` couvre : clic sur relancer déclenche l'appel avec les bons `projetId`/`activiteId`, et l'état désactivé du bouton sur la ligne correspondant au chrono actif.
