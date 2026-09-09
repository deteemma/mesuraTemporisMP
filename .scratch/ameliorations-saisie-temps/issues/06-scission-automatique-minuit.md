# 06: Scission automatique à minuit

**What to build:** remplace le rejet temporaire du ticket 05 — une édition d'heure qui ferait franchir minuit à une Imputation la scinde automatiquement en deux Imputations consécutives plutôt que de la rejeter (voir ADR 0003 et le terme **Scission** dans CONTEXT.md). L'écriture est atomique côté serveur et l'Utilisateur est informé par une notification.

**Blocked by:** 01 (transaction Mongoose), 02 (notification), 05 (édition à la volée)

**Status:** ready-for-agent

- [ ] `PATCH /imputations/:id` détecte un franchissement de jour calendaire (même convention UTC que le reste du code, ex. `T00:00:00.000Z`/`T23:59:59.999Z`) sur l'heure éditée et déclenche une Scission au lieu de rejeter.
- [ ] L'Imputation d'origine est tronquée à la borne du jour ; une nouvelle Imputation est créée pour le même `utilisateurId`/`projetId`/`activiteId`, de la borne opposée jusqu'à l'heure visée par l'édition.
- [ ] Les deux écritures sont effectuées dans une transaction Mongoose (ticket 01) : un échec sur l'une annule l'autre.
- [ ] La réponse de `PATCH` indique si une scission a eu lieu et porte les informations de la nouvelle Imputation créée.
- [ ] Le comportement est symétrique : franchissement en éditant `heureFin` (vers le lendemain) ET en éditant `heureDebut` (vers la veille).
- [ ] Le frontend déclenche une notification (composant du ticket 02) précisant le jour où la nouvelle Imputation a été créée, sans dialogue de confirmation bloquant.
- [ ] La vue reste limitée au jour actuellement affiché : la nouvelle Imputation créée sur un autre jour n'apparaît pas dans la liste courante.
- [ ] `backend/test/imputations.test.js` couvre les deux directions de scission, y compris la vérification des `utilisateurId`/`projetId`/`activiteId` reportés sur la nouvelle Imputation.
- [ ] `saisie-temps.component.spec.ts` couvre la réception d'une réponse de scission et le déclenchement de la notification.
