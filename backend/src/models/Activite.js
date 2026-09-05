const mongoose = require('mongoose');

const activiteSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  projetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
});

module.exports = mongoose.model('Activite', activiteSchema);
