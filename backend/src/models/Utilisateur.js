const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true, trim: true },
  nom: { type: String, default: '' },
  motDePasseHash: { type: String, required: true },
  role: { type: String, enum: ['utilisateur', 'administrateur'], default: 'utilisateur' },
  doitChangerMotDePasse: { type: Boolean, default: true },
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
