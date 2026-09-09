# 01: Infrastructure : MongoDB en replica set pour les écritures atomiques

**What to build:** aucune transaction multi-documents n'existe aujourd'hui dans ce backend, et la base utilisée en dev/test (mongodb-memory-server) tourne en standalone — un replica set est nécessaire pour utiliser les transactions Mongoose. Ce ticket met en place cette infrastructure pour permettre aux tickets 06 (Scission) et 07 (relancer) de garantir des écritures tout-ou-rien.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] L'environnement de test (mongodb-memory-server utilisé par `backend/test/jest.setup.js`) démarre en tant que replica set à un nœud, pas en standalone.
- [ ] L'environnement de dev (`backend/dev-server.js`) est mis à jour de la même façon.
- [ ] Un test backend démontre qu'une transaction Mongoose (`session.startTransaction`/`withTransaction`) portant deux écritures sur deux documents différents est bien tout-ou-rien : en provoquant volontairement un échec sur la seconde écriture, la première est annulée (pas de document orphelin).
- [ ] La suite de tests backend existante continue de passer sans régression liée au changement de topologie Mongo.
- [ ] Une note est laissée indiquant que le déploiement de production devra lui aussi tourner en replica set pour que les tickets 06 et 07 fonctionnent — hors périmètre de vérification de ce ticket, l'infra de production n'étant pas dans ce dépôt.
