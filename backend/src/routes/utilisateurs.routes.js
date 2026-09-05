const express = require('express');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const { supprimerUtilisateurEnCascade } = require('../services/cascade');
const { exigerRole } = require('../middleware/auth');

const router = express.Router();

function toPublicUtilisateur(utilisateur) {
  return {
    id: utilisateur._id,
    login: utilisateur.login,
    nom: utilisateur.nom,
    role: utilisateur.role,
    doitChangerMotDePasse: utilisateur.doitChangerMotDePasse,
  };
}

router.get('/', exigerRole('administrateur'), async (req, res) => {
  const utilisateurs = await Utilisateur.find();
  res.json(utilisateurs.map(toPublicUtilisateur));
});

router.post('/', exigerRole('administrateur'), async (req, res) => {
  const { login, nom } = req.body;
  if (!login) {
    return res.status(400).json({ message: 'Login requis' });
  }

  const existant = await Utilisateur.findOne({ login });
  if (existant) {
    return res.status(409).json({ message: 'Ce login existe déjà' });
  }

  const motDePasseHash = await bcrypt.hash(login, 10);
  const utilisateur = await Utilisateur.create({
    login,
    nom: nom || '',
    motDePasseHash,
    role: 'utilisateur',
    doitChangerMotDePasse: true,
  });

  res.status(201).json(toPublicUtilisateur(utilisateur));
});

router.delete('/:id', exigerRole('administrateur'), async (req, res) => {
  const utilisateur = await Utilisateur.findById(req.params.id);
  if (!utilisateur) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  await supprimerUtilisateurEnCascade(utilisateur._id);
  res.status(204).send();
});

module.exports = router;
