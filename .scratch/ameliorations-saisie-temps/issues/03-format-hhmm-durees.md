# 03: Format hh:mm pour toutes les durées

**What to build:** sur la page Saisie de temps, toute durée affichée (durée d'une Imputation terminée, futurs sous-totaux de groupe et compteur en direct) s'affiche au format `hh:mm`, zero-paddé, sans plafond à 24h — un cumul dépassant 24h (Imputations qui se chevauchent) s'affiche tel quel (ex. "27:15").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `frontend/src/app/shared/duree.util.ts` expose un formatteur unique produisant `hh:mm`, zero-paddé (ex. "02:05"), non plafonné.
- [ ] Toutes les durées affichées sur la page Saisie de temps utilisent ce formatteur ; les anciens formats texte libre ("2 h 15", "45 min") disparaissent.
- [ ] `duree.util.spec.ts` (nouveau fichier) couvre : zero-padding sous l'heure (ex. 5 min → "00:05"), valeurs sous/au-dessus d'une heure, valeur au-delà de 24h.
- [ ] Les tests existants de `saisie-temps.component.spec.ts` qui vérifient l'ancien format sont mis à jour pour refléter le nouveau.
