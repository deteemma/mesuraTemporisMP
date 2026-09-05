const express = require('express');
const Imputation = require('../models/Imputation');
const Projet = require('../models/Projet');
const Activite = require('../models/Activite');
const { estAffecte } = require('../middleware/projetAccess');

const router = express.Router();

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

async function verifierAccesProjetEtActivite(req, res, projetId, activiteId) {
  const projet = await Projet.findById(projetId);
  if (!projet) {
    res.status(404).json({ message: 'Projet introuvable' });
    return null;
  }

  const estAdmin = req.utilisateur.role === 'administrateur';
  if (!estAdmin && !estAffecte(projet, req.utilisateur._id)) {
    res.status(403).json({ message: "Vous n'êtes pas affecté à ce Projet" });
    return null;
  }

  if (activiteId) {
    const activite = await Activite.findOne({ _id: activiteId, projetId });
    if (!activite) {
      res.status(404).json({ message: 'Activité introuvable pour ce Projet' });
      return null;
    }
  }

  return projet;
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

  const projet = await Projet.findById(projetId);
  if (!projet) {
    return res.status(404).json({ message: 'Projet introuvable' });
  }
  const estAdmin = req.utilisateur.role === 'administrateur';
  if (!estAdmin && !estAffecte(projet, req.utilisateur._id)) {
    return res.status(403).json({ message: "Vous n'êtes pas affecté à ce Projet" });
  }

  let activite;
  if (nomNouvelleActivite) {
    activite = await Activite.create({ nom: nomNouvelleActivite, projetId: projet._id });
  } else {
    activite = await Activite.findOne({ _id: activiteId, projetId: projet._id });
    if (!activite) {
      return res.status(404).json({ message: 'Activité introuvable pour ce Projet' });
    }
  }

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

  const projet = await verifierAccesProjetEtActivite(req, res, projetId, activiteId);
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
  const imputation = await Imputation.findById(req.params.id);
  if (!imputation) {
    return res.status(404).json({ message: 'Imputation introuvable' });
  }

  const estAdmin = req.utilisateur.role === 'administrateur';
  const estProprietaire = imputation.utilisateurId.toString() === req.utilisateur._id.toString();
  if (!estAdmin && !estProprietaire) {
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
  const imputation = await Imputation.findById(req.params.id);
  if (!imputation) {
    return res.status(404).json({ message: 'Imputation introuvable' });
  }

  const estAdmin = req.utilisateur.role === 'administrateur';
  const estProprietaire = imputation.utilisateurId.toString() === req.utilisateur._id.toString();
  if (!estAdmin && !estProprietaire) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  await imputation.deleteOne();
  res.status(204).send();
});

module.exports = router;
