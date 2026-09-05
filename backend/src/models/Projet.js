const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  statut: { type: String, default: 'actif' },
  utilisateursAffectes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
});

module.exports = mongoose.model('Projet', projetSchema);
