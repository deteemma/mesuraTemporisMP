const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { creerApp } = require('./src/app');
const { ensureAdminBootstrap } = require('./src/services/bootstrap');

async function demarrer() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await ensureAdminBootstrap();

  const app = creerApp();
  app.listen(3000, () => {
    console.log('DEV_SERVER_READY on http://localhost:3000');
  });
}

demarrer();
