const express = require('express');
const Activite = require('../models/Activite');
const { supprimerActiviteEnCascade } = require('../services/cascade');
const { exigerRole } = require('../middleware/auth');
const { chargerProjetEtVerifierAcces } = require('../middleware/projetAccess');
const { toPublicActivite } = require('../serializers');

const router = express.Router({ mergeParams: true });

router.get('/', chargerProjetEtVerifierAcces(), async (req, res) => {
  const activites = await Activite.find({ projetId: req.projet._id });
  res.json(activites.map(toPublicActivite));
});

router.post('/', exigerRole('administrateur'), chargerProjetEtVerifierAcces(), async (req, res) => {
  const { nom } = req.body;
  if (!nom) {
    return res.status(400).json({ message: 'Nom requis' });
  }

  const activite = await Activite.create({ nom, projetId: req.projet._id });
  res.status(201).json(toPublicActivite(activite));
});

router.patch('/:activiteId', exigerRole('administrateur'), chargerProjetEtVerifierAcces(), async (req, res) => {
  const activite = await Activite.findOne({ _id: req.params.activiteId, projetId: req.projet._id });
  if (!activite) {
    return res.status(404).json({ message: 'Activité introuvable' });
  }

  if (req.body.nom) {
    activite.nom = req.body.nom;
    await activite.save();
  }

  res.json(toPublicActivite(activite));
});

router.delete('/:activiteId', exigerRole('administrateur'), chargerProjetEtVerifierAcces(), async (req, res) => {
  const activite = await Activite.findOne({ _id: req.params.activiteId, projetId: req.projet._id });
  if (!activite) {
    return res.status(404).json({ message: 'Activité introuvable' });
  }

  await supprimerActiviteEnCascade(activite._id);
  res.status(204).send();
});

module.exports = router;
