const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');
const Utilisateur = require('../models/Utilisateur');
const { authentifier } = require('../middleware/auth');
const { toPublicUtilisateur } = require('../serializers');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login, motDePasse } = req.body;
  const utilisateur = await Utilisateur.findOne({ login });
  if (!utilisateur) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse || '', utilisateur.motDePasseHash);
  if (!motDePasseValide) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign({ sub: utilisateur._id.toString() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({ token, utilisateur: toPublicUtilisateur(utilisateur) });
});

router.post('/changer-mot-de-passe', authentifier, async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse } = req.body;
  if (!nouveauMotDePasse || nouveauMotDePasse.length < 1) {
    return res.status(400).json({ message: 'Nouveau mot de passe requis' });
  }

  const utilisateur = req.utilisateur;
  const motDePasseValide = await bcrypt.compare(motDePasseActuel || '', utilisateur.motDePasseHash);
  if (!motDePasseValide) {
    return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
  }

  utilisateur.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);
  utilisateur.doitChangerMotDePasse = false;
  await utilisateur.save();

  res.json({ utilisateur: toPublicUtilisateur(utilisateur) });
});

router.get('/moi', authentifier, (req, res) => {
  res.json({ utilisateur: toPublicUtilisateur(req.utilisateur) });
});

module.exports = router;
