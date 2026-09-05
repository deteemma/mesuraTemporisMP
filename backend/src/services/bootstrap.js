const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');

async function ensureAdminBootstrap() {
  const count = await Utilisateur.countDocuments();
  if (count > 0) return;

  const motDePasseHash = await bcrypt.hash('admin', 10);
  await Utilisateur.create({
    login: 'admin',
    nom: 'Administrateur',
    motDePasseHash,
    role: 'administrateur',
    doitChangerMotDePasse: true,
  });
}

module.exports = { ensureAdminBootstrap };
