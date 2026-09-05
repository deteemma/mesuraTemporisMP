function toPublicUtilisateur(utilisateur) {
  return {
    id: utilisateur._id,
    login: utilisateur.login,
    nom: utilisateur.nom,
    role: utilisateur.role,
    doitChangerMotDePasse: utilisateur.doitChangerMotDePasse,
  };
}

function toPublicProjet(projet) {
  return {
    id: projet._id,
    nom: projet.nom,
    statut: projet.statut,
    utilisateursAffectes: projet.utilisateursAffectes,
  };
}

function toPublicActivite(activite) {
  return { id: activite._id, nom: activite.nom, projetId: activite.projetId };
}

function toPublicImputation(imputation) {
  return {
    id: imputation._id,
    utilisateurId: imputation.utilisateurId,
    projetId: imputation.projetId,
    activiteId: imputation.activiteId,
    heureDebut: imputation.heureDebut,
    heureFin: imputation.heureFin,
  };
}

module.exports = { toPublicUtilisateur, toPublicProjet, toPublicActivite, toPublicImputation };
