require('dotenv').config();
const mongoose = require('mongoose');
const { creerApp } = require('./app');
const { ensureAdminBootstrap } = require('./services/bootstrap');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mesuretemporismp';

async function demarrer() {
  await mongoose.connect(MONGO_URI);
  await ensureAdminBootstrap();

  const app = creerApp();
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

demarrer().catch((err) => {
  console.error("Échec du démarrage de l'application", err);
  process.exit(1);
});
