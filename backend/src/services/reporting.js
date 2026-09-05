const Imputation = require('../models/Imputation');

function journeeDe(date) {
  return date.toISOString().slice(0, 10);
}

function dureeMinutes(imputation) {
  return Math.round((imputation.heureFin.getTime() - imputation.heureDebut.getTime()) / 60000);
}

async function chargerImputationsTerminees(filtre) {
  return Imputation.find({ ...filtre, heureFin: { $ne: null } })
    .populate('utilisateurId', 'login nom')
    .populate('projetId', 'nom')
    .populate('activiteId', 'nom');
}

async function calculerSyntheseJournaliere(utilisateurId, date) {
  const debutJour = new Date(`${date}T00:00:00.000Z`);
  const finJour = new Date(`${date}T23:59:59.999Z`);

  const imputations = await chargerImputationsTerminees({
    utilisateurId,
    heureDebut: { $gte: debutJour, $lte: finJour },
  });

  const groupes = new Map();
  for (const imputation of imputations) {
    const cle = `${imputation.projetId._id}:${imputation.activiteId._id}`;
    if (!groupes.has(cle)) {
      groupes.set(cle, {
        projetId: imputation.projetId._id,
        projetNom: imputation.projetId.nom,
        activiteId: imputation.activiteId._id,
        activiteNom: imputation.activiteId.nom,
        dureeMinutes: 0,
      });
    }
    groupes.get(cle).dureeMinutes += dureeMinutes(imputation);
  }

  const lignes = [...groupes.values()];
  const totalMinutes = lignes.reduce((somme, ligne) => somme + ligne.dureeMinutes, 0);

  return { date, lignes, totalMinutes };
}

async function calculerRapportPlage({ dateDebut, dateFin, utilisateurId }) {
  const debut = new Date(`${dateDebut}T00:00:00.000Z`);
  const fin = new Date(`${dateFin}T23:59:59.999Z`);

  const filtre = { heureDebut: { $gte: debut, $lte: fin } };
  if (utilisateurId) {
    filtre.utilisateurId = utilisateurId;
  }

  const imputations = await chargerImputationsTerminees(filtre);

  const groupes = new Map();
  for (const imputation of imputations) {
    const journee = journeeDe(imputation.heureDebut);
    const cle = `${imputation.utilisateurId._id}:${imputation.projetId._id}:${imputation.activiteId._id}:${journee}`;
    if (!groupes.has(cle)) {
      groupes.set(cle, {
        utilisateurId: imputation.utilisateurId._id,
        utilisateurLogin: imputation.utilisateurId.login,
        projetId: imputation.projetId._id,
        projetNom: imputation.projetId.nom,
        activiteId: imputation.activiteId._id,
        activiteNom: imputation.activiteId.nom,
        journee,
        dureeMinutes: 0,
      });
    }
    groupes.get(cle).dureeMinutes += dureeMinutes(imputation);
  }

  const lignes = [...groupes.values()].sort((a, b) => a.journee.localeCompare(b.journee));
  const totalMinutes = lignes.reduce((somme, ligne) => somme + ligne.dureeMinutes, 0);

  return { dateDebut, dateFin, lignes, totalMinutes };
}

module.exports = { calculerSyntheseJournaliere, calculerRapportPlage };
