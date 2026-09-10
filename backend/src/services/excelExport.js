const ExcelJS = require('exceljs');

// Zero-paddé, sans plafond à 24h (même principe que le formatteur frontend
// équivalent) — dupliqué ici faute de module partagé entre les deux runtimes.
function formatSecondesHHMMSS(totalSecondes) {
  const secondes = Math.max(0, Math.round(totalSecondes));
  const heures = Math.floor(secondes / 3600);
  const minutesRestantes = Math.floor((secondes % 3600) / 60);
  const secondesRestantes = secondes % 60;
  return `${String(heures).padStart(2, '0')}:${String(minutesRestantes).padStart(2, '0')}:${String(secondesRestantes).padStart(2, '0')}`;
}

async function genererClasseurRapport(rapport) {
  const classeur = new ExcelJS.Workbook();
  const feuille = classeur.addWorksheet('Rapport');

  feuille.columns = [
    { header: 'Utilisateur', key: 'utilisateurLogin', width: 20 },
    { header: 'Projet', key: 'projetNom', width: 20 },
    { header: 'Activité', key: 'activiteNom', width: 20 },
    { header: 'Journée', key: 'journee', width: 15 },
    { header: 'Durée (minutes)', key: 'dureeMinutes', width: 15 },
    { header: 'Durée (hh:mm:ss)', key: 'dureeFormatee', width: 15 },
  ];

  for (const ligne of rapport.lignes) {
    feuille.addRow({
      ...ligne,
      dureeMinutes: Math.round(ligne.dureeSecondes / 60),
      dureeFormatee: formatSecondesHHMMSS(ligne.dureeSecondes),
    });
  }

  return classeur;
}

module.exports = { genererClasseurRapport };
