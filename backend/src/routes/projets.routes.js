const express = require('express');
const Projet = require('../models/Projet');
const Utilisateur = require('../models/Utilisateur');
const { supprimerProjetEnCascade } = require('../services/cascade');
const { exigerRole } = require('../middleware/auth');
const { chargerProjetEtVerifierAcces } = require('../middleware/projetAccess');
const { chargerOuNotFound } = require('../utils/chargerOuNotFound');
const { estAdministrateur } = require('../utils/roles');
const { memeId } = require('../utils/mongoId');
const { toPublicProjet } = require('../serializers');

const router = express.Router();

router.get('/', async (req, res) => {
  const filtre = estAdministrateur(req.utilisateur) ? {} : { utilisateursAffectes: req.utilisateur._id };
  const projets = await Projet.find(filtre);
  res.json(projets.map(toPublicProjet));
});

router.get('/:projetId', chargerProjetEtVerifierAcces(), (req, res) => {
  res.json(toPublicProjet(req.projet));
});

router.post('/', exigerRole('administrateur'), async (req, res) => {
  const { nom } = req.body;
  if (!nom) {
    return res.status(400).json({ message: 'Nom requis' });
  }

  const projet = await Projet.create({ nom, statut: 'actif', utilisateursAffectes: [] });
  res.status(201).json(toPublicProjet(projet));
});

router.delete('/:projetId', exigerRole('administrateur'), async (req, res) => {
  const projet = await chargerOuNotFound(Projet, req.params.projetId, res, 'Projet introuvable');
  if (!projet) return;

  await supprimerProjetEnCascade(projet._id);
  res.status(204).send();
});

router.post('/:projetId/utilisateurs', exigerRole('administrateur'), async (req, res) => {
  const projet = await chargerOuNotFound(Projet, req.params.projetId, res, 'Projet introuvable');
  if (!projet) return;

  const { utilisateurId } = req.body;
  const utilisateur = await chargerOuNotFound(Utilisateur, utilisateurId, res, 'Utilisateur introuvable');
  if (!utilisateur) return;

  const dejaAffecte = projet.utilisateursAffectes.some((id) => memeId(id, utilisateurId));
  if (!dejaAffecte) {
    projet.utilisateursAffectes.push(utilisateur._id);
    await projet.save();
  }

  res.json(toPublicProjet(projet));
});

router.delete('/:projetId/utilisateurs/:utilisateurId', exigerRole('administrateur'), async (req, res) => {
  const projet = await chargerOuNotFound(Projet, req.params.projetId, res, 'Projet introuvable');
  if (!projet) return;

  projet.utilisateursAffectes = projet.utilisateursAffectes.filter(
    (id) => !memeId(id, req.params.utilisateurId),
  );
  await projet.save();

  res.json(toPublicProjet(projet));
});

module.exports = router;
