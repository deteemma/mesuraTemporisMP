# 02: Agrégation du Rapport en secondes et colonne Excel hh:mm:ss

**What to build:** le calcul serveur des durées du Rapport (synthèse par plage de dates et synthèse journalière) devient précis à la seconde plutôt qu'à la minute pré-arrondie par Imputation, et l'export Excel du Rapport gagne une colonne texte "Durée (hh:mm:ss)" en plus de la colonne minutes existante.

**Blocked by:** None (can start immediately, indépendant du ticket 01)

**Status:** ready-for-agent

- [ ] `backend/src/services/reporting.js` : le helper de calcul de durée par Imputation travaille en secondes exactes (sans arrondi intermédiaire à la minute), utilisé par `calculerSyntheseJournaliere` et `calculerRapportPlage`.
- [ ] Les lignes et totaux renvoyés par ces deux fonctions exposent des champs en secondes (`dureeSecondes` par ligne, `totalSecondes` global) au lieu des champs minutes actuels. `GET /rapports/journalier` et `GET /rapports/plage` renvoient donc ce nouveau contrat JSON ; aucun changement de route ou de paramètre.
- [ ] `backend/src/services/excelExport.js` : la colonne existante "Durée (minutes)" est conservée (dérivée de la nouvelle donnée en secondes, même arrondi visible qu'aujourd'hui) et une nouvelle colonne texte "Durée (hh:mm:ss)" est ajoutée, formatée en zero-paddé et non plafonnée à 24h (même principe que le frontend, logique dupliquée côté backend faute de module partagé entre les deux runtimes).
- [ ] `rapportPlage.test.js` et `rapportJournalier.test.js` sont mis à jour pour asserter sur `totalSecondes`/`dureeSecondes`, et un nouveau cas vérifie qu'une agrégation d'Imputations dont la durée n'est pas un multiple exact de la minute ne perd pas de précision.
- [ ] `exportExcel.test.js` est mis à jour : l'entête attendue inclut "Durée (hh:mm:ss)" en plus de "Durée (minutes)", et les valeurs de la ligne de données vérifient les deux colonnes.
