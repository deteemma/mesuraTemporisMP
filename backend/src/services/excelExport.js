const ExcelJS = require('exceljs');

async function genererClasseurRapport(rapport) {
  const classeur = new ExcelJS.Workbook();
  const feuille = classeur.addWorksheet('Rapport');

  feuille.columns = [
    { header: 'Utilisateur', key: 'utilisateurLogin', width: 20 },
    { header: 'Projet', key: 'projetNom', width: 20 },
    { header: 'Activité', key: 'activiteNom', width: 20 },
    { header: 'Journée', key: 'journee', width: 15 },
    { header: 'Durée (minutes)', key: 'dureeMinutes', width: 15 },
  ];

  for (const ligne of rapport.lignes) {
    feuille.addRow(ligne);
  }

  return classeur;
}

module.exports = { genererClasseurRapport };
