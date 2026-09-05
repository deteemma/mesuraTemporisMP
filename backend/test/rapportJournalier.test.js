const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

describe('Synthèse journalière du temps imputé', () => {
  test('la synthèse regroupe le temps par Projet et par Activité, en excluant les Imputations ouvertes', async () => {
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

    const aujourdhui = new Date().toISOString().slice(0, 10);

    await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId: projet.body.id,
        activiteId: activite.body.id,
        heureDebut: `${aujourdhui}T09:00:00.000Z`,
        heureFin: `${aujourdhui}T10:00:00.000Z`,
      });
    await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId: projet.body.id,
        activiteId: activite.body.id,
        heureDebut: `${aujourdhui}T11:00:00.000Z`,
        heureFin: `${aujourdhui}T11:30:00.000Z`,
      });

    // Imputation ouverte (chronomètre en cours, démarrée aujourd'hui) : ne doit pas compter dans le total.
    await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId: projet.body.id, activiteId: activite.body.id });

    const synthese = await request(app)
      .get('/api/rapports/journalier')
      .query({ date: aujourdhui })
      .set('Authorization', `Bearer ${userToken}`);

    expect(synthese.status).toBe(200);
    expect(synthese.body.totalMinutes).toBe(90);
    expect(synthese.body.lignes).toHaveLength(1);
    expect(synthese.body.lignes[0].dureeMinutes).toBe(90);
    expect(synthese.body.lignes[0].projetNom).toBe('Projet Alpha');
    expect(synthese.body.lignes[0].activiteNom).toBe('Développement');
  });
});
