const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { creerApp } = require('./src/app');
const { ensureAdminBootstrap } = require('./src/services/bootstrap');

async function demarrer() {
  // Replica set à un seul nœud : requis pour que les transactions multi-documents
  // Mongoose (session.startTransaction / withTransaction) fonctionnent, MongoDB ne
  // les supportant pas en topologie standalone. NOTE: le déploiement de production
  // devra lui aussi tourner en replica set pour que les tickets 06 (Scission) et 07
  // (relancer) puissent utiliser des transactions — cette infra n'est pas dans ce dépôt.
  const mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongoServer.getUri());
  await ensureAdminBootstrap();

  const app = creerApp();
  app.listen(3000, () => {
    console.log('DEV_SERVER_READY on http://localhost:3000');
  });
}

demarrer();
