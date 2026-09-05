const Utilisateur = require('../models/Utilisateur');
const Projet = require('../models/Projet');
const Activite = require('../models/Activite');
const Imputation = require('../models/Imputation');

async function supprimerUtilisateurEnCascade(utilisateurId) {
  await Imputation.deleteMany({ utilisateurId });
  await Projet.updateMany(
    { utilisateursAffectes: utilisateurId },
    { $pull: { utilisateursAffectes: utilisateurId } },
  );
  await Utilisateur.deleteOne({ _id: utilisateurId });
}

async function supprimerProjetEnCascade(projetId) {
  const activites = await Activite.find({ projetId });
  const activiteIds = activites.map((activite) => activite._id);
  await Imputation.deleteMany({ activiteId: { $in: activiteIds } });
  await Activite.deleteMany({ projetId });
  await Projet.deleteOne({ _id: projetId });
}

async function supprimerActiviteEnCascade(activiteId) {
  await Imputation.deleteMany({ activiteId });
  await Activite.deleteOne({ _id: activiteId });
}

module.exports = {
  supprimerUtilisateurEnCascade,
  supprimerProjetEnCascade,
  supprimerActiviteEnCascade,
};
