const express = require('express');
const Imputation = require('../models/Imputation');
const Activite = require('../models/Activite');
const { verifierAccesProjet, verifierAccesActivite } = require('../middleware/projetAccess');
const { chargerOuNotFound } = require('../utils/chargerOuNotFound');
const { estAdministrateur } = require('../utils/roles');
const { memeId } = require('../utils/mongoId');
const { toPublicImputation } = require('../serializers');

const router = express.Router();

async function chargerProjetEtActivite(req, res, projetId, activiteId) {
  const { projet, erreur } = await verifierAccesProjet(projetId, req.utilisateur);
  if (erreur) {
    res.status(erreur.statut).json({ message: erreur.message });
    return null;
  }

  if (activiteId) {
    const { erreur: erreurActivite } = await verifierAccesActivite(projet, activiteId);
    if (erreurActivite) {
      res.status(erreurActivite.statut).json({ message: erreurActivite.message });
      return null;
    }
  }

  return projet;
}

function estProprietaireOuAdmin(req, imputation) {
  return estAdministrateur(req.utilisateur) || memeId(imputation.utilisateurId, req.utilisateur._id);
}

router.get('/chrono/status', async (req, res) => {
  const imputationOuverte = await Imputation.findOne({
    utilisateurId: req.utilisateur._id,
    heureFin: null,
  });
  res.json(imputationOuverte ? toPublicImputation(imputationOuverte) : null);
});

router.post('/chrono/start', async (req, res) => {
  const { projetId, activiteId, nomNouvelleActivite } = req.body;

  const dejaOuverte = await Imputation.findOne({
    utilisateurId: req.utilisateur._id,
    heureFin: null,
  });
  if (dejaOuverte) {
    return res.status(409).json({ message: 'Un chronomètre est déjà actif' });
  }

  const projet = await chargerProjetEtActivite(req, res, projetId, nomNouvelleActivite ? null : activiteId);
  if (!projet) return;

  const activite = nomNouvelleActivite
    ? await Activite.create({ nom: nomNouvelleActivite, projetId: projet._id })
    : await Activite.findOne({ _id: activiteId, projetId: projet._id });

  const imputation = await Imputation.create({
    utilisateurId: req.utilisateur._id,
    projetId: projet._id,
    activiteId: activite._id,
    heureDebut: new Date(),
    heureFin: null,
  });

  res.status(201).json(toPublicImputation(imputation));
});

router.post('/chrono/stop', async (req, res) => {
  const imputationOuverte = await Imputation.findOne({
    utilisateurId: req.utilisateur._id,
    heureFin: null,
  });
  if (!imputationOuverte) {
    return res.status(404).json({ message: 'Aucun chronomètre actif' });
  }

  imputationOuverte.heureFin = new Date();
  await imputationOuverte.save();

  res.json(toPublicImputation(imputationOuverte));
});

router.post('/', async (req, res) => {
  const { projetId, activiteId, heureDebut, heureFin } = req.body;
  if (!projetId || !activiteId || !heureDebut || !heureFin) {
    return res.status(400).json({ message: 'projetId, activiteId, heureDebut et heureFin sont requis' });
  }

  const projet = await chargerProjetEtActivite(req, res, projetId, activiteId);
  if (!projet) return;

  const imputation = await Imputation.create({
    utilisateurId: req.utilisateur._id,
    projetId,
    activiteId,
    heureDebut: new Date(heureDebut),
    heureFin: new Date(heureFin),
  });

  res.status(201).json(toPublicImputation(imputation));
});

router.get('/', async (req, res) => {
  const filtre = { utilisateurId: req.utilisateur._id };
  if (req.query.date) {
    const debutJour = new Date(`${req.query.date}T00:00:00.000Z`);
    const finJour = new Date(`${req.query.date}T23:59:59.999Z`);
    filtre.heureDebut = { $gte: debutJour, $lte: finJour };
  }

  const imputations = await Imputation.find(filtre).sort({ heureDebut: -1 });
  res.json(imputations.map(toPublicImputation));
});

router.patch('/:id', async (req, res) => {
  const imputation = await chargerOuNotFound(Imputation, req.params.id, res, 'Imputation introuvable');
  if (!imputation) return;

  if (!estProprietaireOuAdmin(req, imputation)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  if (req.body.heureDebut) {
    imputation.heureDebut = new Date(req.body.heureDebut);
  }
  if (req.body.heureFin) {
    imputation.heureFin = new Date(req.body.heureFin);
  }
  await imputation.save();

  res.json(toPublicImputation(imputation));
});

router.delete('/:id', async (req, res) => {
  const imputation = await chargerOuNotFound(Imputation, req.params.id, res, 'Imputation introuvable');
  if (!imputation) return;

  if (!estProprietaireOuAdmin(req, imputation)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  await imputation.deleteOne();
  res.status(204).send();
});

module.exports = router;
