const express = require('express');
const { calculerSyntheseJournaliere, calculerRapportPlage } = require('../services/reporting');
const { genererClasseurRapport } = require('../services/excelExport');

const router = express.Router();

router.get('/journalier', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const synthese = await calculerSyntheseJournaliere(req.utilisateur._id, date);
  res.json(synthese);
});

router.get('/plage', async (req, res) => {
  const { dateDebut, dateFin } = req.query;
  if (!dateDebut || !dateFin) {
    return res.status(400).json({ message: 'dateDebut et dateFin sont requis' });
  }

  const estAdmin = req.utilisateur.role === 'administrateur';
  const rapport = await calculerRapportPlage({
    dateDebut,
    dateFin,
    utilisateurId: estAdmin ? null : req.utilisateur._id,
  });

  res.json(rapport);
});

router.get('/plage/export', async (req, res) => {
  const { dateDebut, dateFin } = req.query;
  if (!dateDebut || !dateFin) {
    return res.status(400).json({ message: 'dateDebut et dateFin sont requis' });
  }

  const estAdmin = req.utilisateur.role === 'administrateur';
  const rapport = await calculerRapportPlage({
    dateDebut,
    dateFin,
    utilisateurId: estAdmin ? null : req.utilisateur._id,
  });

  const classeur = await genererClasseurRapport(rapport);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="rapport-${dateDebut}-${dateFin}.xlsx"`);

  await classeur.xlsx.write(res);
  res.end();
});

module.exports = router;
