const express = require('express');
const Projet = require('../models/Projet');
const Utilisateur = require('../models/Utilisateur');
const { supprimerProjetEnCascade } = require('../services/cascade');
const { exigerRole } = require('../middleware/auth');
const { chargerProjetEtVerifierAcces } = require('../middleware/projetAccess');

const router = express.Router();

function toPublicProjet(projet) {
  return {
    id: projet._id,
    nom: projet.nom,
    statut: projet.statut,
    utilisateursAffectes: projet.utilisateursAffectes,
  };
}

router.get('/', async (req, res) => {
  const estAdmin = req.utilisateur.role === 'administrateur';
  const filtre = estAdmin ? {} : { utilisateursAffectes: req.utilisateur._id };
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
  const projet = await Projet.findById(req.params.projetId);
  if (!projet) {
    return res.status(404).json({ message: 'Projet introuvable' });
  }

  await supprimerProjetEnCascade(projet._id);
  res.status(204).send();
});

router.post('/:projetId/utilisateurs', exigerRole('administrateur'), async (req, res) => {
  const projet = await Projet.findById(req.params.projetId);
  if (!projet) {
    return res.status(404).json({ message: 'Projet introuvable' });
  }

  const { utilisateurId } = req.body;
  const utilisateur = await Utilisateur.findById(utilisateurId);
  if (!utilisateur) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  const dejaAffecte = projet.utilisateursAffectes.some((id) => id.toString() === utilisateurId);
  if (!dejaAffecte) {
    projet.utilisateursAffectes.push(utilisateur._id);
    await projet.save();
  }

  res.json(toPublicProjet(projet));
});

router.delete('/:projetId/utilisateurs/:utilisateurId', exigerRole('administrateur'), async (req, res) => {
  const projet = await Projet.findById(req.params.projetId);
  if (!projet) {
    return res.status(404).json({ message: 'Projet introuvable' });
  }

  projet.utilisateursAffectes = projet.utilisateursAffectes.filter(
    (id) => id.toString() !== req.params.utilisateurId,
  );
  await projet.save();

  res.json(toPublicProjet(projet));
});

module.exports = router;
