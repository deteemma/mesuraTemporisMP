const request = require('supertest');
const ExcelJS = require('exceljs');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

describe('Export Excel du rapport', () => {
  test('génère un fichier .xlsx valide avec les lignes attendues', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const projet = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Alpha' });
    await request(app)
      .post(`/api/projets/${projet.body.id}/utilisateurs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ utilisateurId });
    const activite = await request(app)
      .post(`/api/projets/${projet.body.id}/activites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Développement' });

    await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId: projet.body.id,
        activiteId: activite.body.id,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    const export_ = await request(app)
      .get('/api/rapports/plage/export')
      .query({ dateDebut: '2026-01-01', dateFin: '2026-01-31' })
      .set('Authorization', `Bearer ${userToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(export_.status).toBe(200);
    expect(export_.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    const classeur = new ExcelJS.Workbook();
    await classeur.xlsx.load(export_.body);
    const feuille = classeur.getWorksheet('Rapport');

    expect(feuille).toBeDefined();
    const entetes = feuille.getRow(1).values.slice(1);
    expect(entetes).toEqual(['Utilisateur', 'Projet', 'Activité', 'Journée', 'Durée (minutes)', 'Durée (hh:mm:ss)']);

    const ligneDonnees = feuille.getRow(2).values.slice(1);
    expect(ligneDonnees[0]).toBe('jdupont');
    expect(ligneDonnees[1]).toBe('Projet Alpha');
    expect(ligneDonnees[2]).toBe('Développement');
    expect(ligneDonnees[4]).toBe(60);
    expect(ligneDonnees[5]).toBe('01:00:00');
  });
});
