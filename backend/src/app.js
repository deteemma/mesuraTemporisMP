const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const utilisateursRoutes = require('./routes/utilisateurs.routes');
const projetsRoutes = require('./routes/projets.routes');
const activitesRoutes = require('./routes/activites.routes');
const imputationsRoutes = require('./routes/imputations.routes');
const rapportsRoutes = require('./routes/rapports.routes');
const { authentifier, exigerMotDePasseAJour } = require('./middleware/auth');

function creerApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);

  app.use('/api/utilisateurs', authentifier, exigerMotDePasseAJour, utilisateursRoutes);
  app.use('/api/projets', authentifier, exigerMotDePasseAJour, projetsRoutes);
  app.use('/api/projets/:projetId/activites', authentifier, exigerMotDePasseAJour, activitesRoutes);
  app.use('/api/imputations', authentifier, exigerMotDePasseAJour, imputationsRoutes);
  app.use('/api/rapports', authentifier, exigerMotDePasseAJour, rapportsRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  });

  return app;
}

module.exports = { creerApp };
