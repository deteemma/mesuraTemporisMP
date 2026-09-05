const Projet = require('../models/Projet');

function estAffecte(projet, utilisateurId) {
  return projet.utilisateursAffectes.some((id) => id.toString() === utilisateurId.toString());
}

function chargerProjetEtVerifierAcces(paramName = 'projetId') {
  return async (req, res, next) => {
    const projet = await Projet.findById(req.params[paramName]);
    if (!projet) {
      return res.status(404).json({ message: 'Projet introuvable' });
    }

    const estAdmin = req.utilisateur.role === 'administrateur';
    if (!estAdmin && !estAffecte(projet, req.utilisateur._id)) {
      return res.status(403).json({ message: "Vous n'êtes pas affecté à ce Projet" });
    }

    req.projet = projet;
    next();
  };
}

module.exports = { chargerProjetEtVerifierAcces, estAffecte };
