# 03: Page Rapport affichée en hh:mm:ss

**What to build:** la page Rapport affiche ses durées de ligne et ses totaux (par jour, sur la période) au même format `hh:mm:ss` que la Saisie de temps, au lieu de son format texte actuel ("Xh Ymin").

**Blocked by:** 01 (réutilise `formatSecondesHHMMSS`), 02 (consomme les champs `dureeSecondes`/`totalSecondes`)

**Status:** ready-for-agent

- [ ] `frontend/src/app/models/imputation.ts` : `RapportLigne.dureeMinutes` devient `dureeSecondes`, `Rapport.totalMinutes` devient `totalSecondes`.
- [ ] `frontend/src/app/pages/rapport/rapport.component.ts` : remplace l'usage de `formatMinutes` par `formatSecondesHHMMSS` (ticket 01) ; `GroupeJour.totalMinutes` devient `totalSecondes`, calculé à partir de `dureeSecondes`.
- [ ] `rapport.component.html` : les trois affichages de durée (total sur la période, total par jour, durée par ligne) utilisent `formatSecondesHHMMSS` sur les champs renommés.
- [ ] `rapport.component.spec.ts` est mis à jour : les payloads simulés (`flush`) utilisent `dureeSecondes`/`totalSecondes`, et les assertions vérifient l'affichage au format `hh:mm:ss`.
