# 08: Regroupement par Projet+Activité et retrait de la synthèse

**What to build:** les Imputations terminées du jour affiché sont regroupées par Projet+Activité, repliées par défaut avec un total cumulé, et le bloc "synthèse" séparé (devenu redondant) est retiré.

**Blocked by:** 03 (utilise le formatteur hh:mm pour les sous-totaux)

**Status:** ready-for-agent

- [ ] La liste des imputations terminées du jour est regroupée par couple (`projetId`, `activiteId`).
- [ ] Chaque groupe affiche, à l'état replié, le Projet, l'Activité, le total cumulé en `hh:mm` (formatteur du ticket 03) et le nombre de lignes.
- [ ] Les groupes sont repliés par défaut ; l'Utilisateur peut déplier/replier chaque groupe individuellement.
- [ ] Une fois déplié, un groupe affiche le détail de ses lignes individuelles (heures, et les actions existantes — suppression, et à venir — édition à la volée, relancer — restent fonctionnelles sur ces lignes).
- [ ] Les groupes sont ordonnés selon l'heure de départ de leur première Imputation (ordre chronologique).
- [ ] L'état déplié/replié n'est pas mémorisé entre rechargements de page (retombe replié par défaut).
- [ ] Le bloc "synthèse" séparé et son appel à `RapportService.syntheseJournaliere` sont retirés du composant.
- [ ] `saisie-temps.component.spec.ts` couvre : regroupement correct (y compris un cas de total > 24h), état replié par défaut, bascule déplié/replié, absence d'appel à `/rapports/journalier`.
