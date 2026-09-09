# 05: Édition à la volée de l'heure de début/fin (cas même jour)

**What to build:** sur une ligne d'Imputation terminée, l'Utilisateur peut cliquer directement sur l'heure de début ou de fin pour la modifier, sans formulaire séparé. Une édition qui ferait franchir minuit à l'Imputation est pour l'instant refusée avec un message d'erreur (ce rejet temporaire sera remplacé par la Scission automatique du ticket 06).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Cliquer sur l'heure de début ou de fin d'une Imputation terminée la transforme en champ éditable.
- [ ] Valider (Entrée ou perte de focus) enregistre via `PATCH /imputations/:id` existant et met à jour l'affichage.
- [ ] Échap annule l'édition sans effet de bord.
- [ ] L'édition à la volée n'est disponible que sur les Imputations terminées, pas sur la ligne du chrono actif.
- [ ] Une édition qui ferait franchir minuit à l'Imputation (heure de fin antérieure à l'heure de début une fois éditée) est refusée avec un message d'erreur clair, sans modifier la donnée.
- [ ] `backend/test/imputations.test.js` couvre l'édition simple de `heureDebut`/`heureFin` (succès, et contrôle d'autorisation propriétaire/Administrateur existant, inchangé).
- [ ] `saisie-temps.component.spec.ts` couvre : édition réussie, annulation, et rejet du cas de franchissement de minuit.
