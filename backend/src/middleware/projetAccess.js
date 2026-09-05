const Projet = require('../models/Projet');
const Activite = require('../models/Activite');
const { estAdministrateur } = require('../utils/roles');
const { memeId } = require('../utils/mongoId');

function estAffecte(projet, utilisateurId) {
  return projet.utilisateursAffectes.some((id) => memeId(id, utilisateurId));
}

async function verifierAccesProjet(projetId, utilisateur) {
  const projet = await Projet.findById(projetId);
  if (!projet) {
    return { erreur: { statut: 404, message: 'Projet introuvable' } };
  }
  if (!estAdministrateur(utilisateur) && !estAffecte(projet, utilisateur._id)) {
    return { erreur: { statut: 403, message: "Vous n'êtes pas affecté à ce Projet" } };
  }
  return { projet };
}

async function verifierAccesActivite(projet, activiteId) {
  const activite = await Activite.findOne({ _id: activiteId, projetId: projet._id });
  if (!activite) {
    return { erreur: { statut: 404, message: 'Activité introuvable pour ce Projet' } };
  }
  return { activite };
}

function chargerProjetEtVerifierAcces(paramName = 'projetId') {
  return async (req, res, next) => {
    const { projet, erreur } = await verifierAccesProjet(req.params[paramName], req.utilisateur);
    if (erreur) {
      return res.status(erreur.statut).json({ message: erreur.message });
    }
    req.projet = projet;
    next();
  };
}

module.exports = {
  chargerProjetEtVerifierAcces,
  verifierAccesProjet,
  verifierAccesActivite,
  estAffecte,
};
