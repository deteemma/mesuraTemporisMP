const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

async function preparerDonnees(app, adminToken) {
  const { token: token1, id: utilisateurId1 } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
  const { token: token2, id: utilisateurId2 } = await creerEtConnecterUtilisateur(app, adminToken, 'amartin');

  const projet = await request(app)
    .post('/api/projets')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nom: 'Projet Alpha' });
  await request(app)
    .post(`/api/projets/${projet.body.id}/utilisateurs`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ utilisateurId: utilisateurId1 });
  await request(app)
    .post(`/api/projets/${projet.body.id}/utilisateurs`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ utilisateurId: utilisateurId2 });

  const activite = await request(app)
    .post(`/api/projets/${projet.body.id}/activites`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nom: 'Développement' });

  await request(app)
    .post('/api/imputations')
    .set('Authorization', `Bearer ${token1}`)
    .send({
      projetId: projet.body.id,
      activiteId: activite.body.id,
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: '2026-01-05T10:00:00.000Z',
    });
  await request(app)
    .post('/api/imputations')
    .set('Authorization', `Bearer ${token1}`)
    .send({
      projetId: projet.body.id,
      activiteId: activite.body.id,
      heureDebut: '2026-01-06T09:00:00.000Z',
      heureFin: '2026-01-06T10:30:00.000Z',
    });
  await request(app)
    .post('/api/imputations')
    .set('Authorization', `Bearer ${token2}`)
    .send({
      projetId: projet.body.id,
      activiteId: activite.body.id,
      heureDebut: '2026-01-05T13:00:00.000Z',
      heureFin: '2026-01-05T14:00:00.000Z',
    });

  return { token1, token2 };
}

describe('Rapport de synthèse sur une plage de dates', () => {
  test('un Utilisateur ne voit que ses propres Imputations, regroupées par Journée', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token1 } = await preparerDonnees(app, adminToken);

    const rapport = await request(app)
      .get('/api/rapports/plage')
      .query({ dateDebut: '2026-01-01', dateFin: '2026-01-31' })
      .set('Authorization', `Bearer ${token1}`);

    expect(rapport.status).toBe(200);
    expect(rapport.body.lignes).toHaveLength(2);
    expect(rapport.body.totalMinutes).toBe(150);
    expect(rapport.body.lignes.every((ligne) => ligne.utilisateurLogin === 'jdupont')).toBe(true);
  });

  test('un Administrateur voit les Imputations de tous les Utilisateurs', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    await preparerDonnees(app, adminToken);

    const rapport = await request(app)
      .get('/api/rapports/plage')
      .query({ dateDebut: '2026-01-01', dateFin: '2026-01-31' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(rapport.status).toBe(200);
    expect(rapport.body.lignes).toHaveLength(3);
    expect(rapport.body.totalMinutes).toBe(210);
  });

  test('une plage d\'une seule journée fonctionne comme cas particulier', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    await preparerDonnees(app, adminToken);

    const rapport = await request(app)
      .get('/api/rapports/plage')
      .query({ dateDebut: '2026-01-05', dateFin: '2026-01-05' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(rapport.status).toBe(200);
    expect(rapport.body.lignes).toHaveLength(2);
    expect(rapport.body.totalMinutes).toBe(120);
  });
});
