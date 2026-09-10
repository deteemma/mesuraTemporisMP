# 01: Compteur et durées de la Saisie de temps en hh:mm:ss

**What to build:** sur la page Saisie de temps, l'Utilisateur voit le compteur du chronomètre actif progresser visiblement seconde par seconde (au lieu de rester figé jusqu'à la minute suivante), et toutes les durées de la page (ligne d'Imputation terminée, total de groupe) s'affichent au format `hh:mm:ss`, zero-paddé, sans plafond à 24h.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `frontend/src/app/shared/duree.util.ts` expose un formatteur unique `formatSecondesHHMMSS(totalSecondes: number): string`, zero-paddé sur minutes et secondes, heures non plafonnées (ex. "27:15:42"). `formatMinutesHHMM` et `formatMinutes` ("Xh Ymin") sont retirés.
- [ ] `formatDuree(heureDebut, heureFin)` calcule un nombre de secondes exact entre les deux bornes (sans arrondi intermédiaire à la minute) et délègue à `formatSecondesHHMMSS`.
- [ ] Le compteur du chronomètre actif (`mettreAJourCompteur`) calcule les secondes réellement écoulées depuis `heureDebut` et les affiche via `formatSecondesHHMMSS` ; il continue de se rafraîchir automatiquement (l'intervalle existant d'une seconde suffit déjà).
- [ ] Le total de chaque groupe (Projet+Activité) sur la Saisie de temps est recalculé à partir de la somme des secondes exactes de ses lignes (pas de la somme de minutes déjà arrondies par ligne), puis affiché via `formatSecondesHHMMSS`.
- [ ] L'édition à la volée des heures de début/fin n'est pas modifiée : elle reste au format `hh:mm`, ce qui produit naturellement des Durées affichées avec `:00` en secondes pour les Imputations éditées manuellement.
- [ ] `duree.util.spec.ts` est réécrit pour `formatSecondesHHMMSS` (zero-padding sous la minute, valeur pile sur la minute/l'heure, valeur au-delà de 24h) et pour le nouveau comportement de `formatDuree` (précision à la seconde).
- [ ] `saisie-temps.component.spec.ts` est étendu : un test `fakeAsync`/`tick` vérifie que le compteur progresse seconde par seconde ; un test de regroupement vérifie qu'un total de groupe composé de durées non multiples de la minute (ex. deux Imputations de 30 secondes) reflète la somme exacte en `hh:mm:ss`.
