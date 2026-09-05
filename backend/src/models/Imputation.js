const mongoose = require('mongoose');

const imputationSchema = new mongoose.Schema({
  utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  projetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
  activiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activite', required: true },
  heureDebut: { type: Date, required: true },
  heureFin: { type: Date, default: null },
});

module.exports = mongoose.model('Imputation', imputationSchema);
