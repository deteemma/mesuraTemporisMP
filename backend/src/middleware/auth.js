const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const Utilisateur = require('../models/Utilisateur');

async function authentifier(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Jeton invalide ou expiré' });
  }

  const utilisateur = await Utilisateur.findById(payload.sub);
  if (!utilisateur) {
    return res.status(401).json({ message: 'Utilisateur introuvable' });
  }

  req.utilisateur = utilisateur;
  next();
}

function exigerMotDePasseAJour(req, res, next) {
  if (req.utilisateur.doitChangerMotDePasse) {
    return res.status(403).json({ message: 'Changement de mot de passe requis' });
  }
  next();
}

function exigerRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { authentifier, exigerMotDePasseAJour, exigerRole };
