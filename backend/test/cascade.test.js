const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

async function creerProjetActiviteImputation(app, adminToken, userToken, utilisateurId) {
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
  const imputation = await request(app)
    .post('/api/imputations')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      projetId: projet.body.id,
      activiteId: activite.body.id,
      heureDebut: '2026-01-05T09:00:00.000Z',
      heureFin: '2026-01-05T10:00:00.000Z',
    });
  return { projetId: projet.body.id, activiteId: activite.body.id, imputationId: imputation.body.id };
}

describe('Suppression en cascade des Imputations', () => {
  test('supprimer un Utilisateur supprime toutes ses Imputations', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { imputationId } = await creerProjetActiviteImputation(app, adminToken, userToken, utilisateurId);

    await request(app).delete(`/api/utilisateurs/${utilisateurId}`).set('Authorization', `Bearer ${adminToken}`);

    const acces = await request(app)
      .patch(`/api/imputations/${imputationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(acces.status).toBe(404);
  });

  test('supprimer un Projet supprime toutes les Imputations qui s\'y rattachent', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, imputationId } = await creerProjetActiviteImputation(app, adminToken, userToken, utilisateurId);

    await request(app).delete(`/api/projets/${projetId}`).set('Authorization', `Bearer ${adminToken}`);

    const acces = await request(app)
      .patch(`/api/imputations/${imputationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(acces.status).toBe(404);
  });

  test('supprimer une Activité supprime toutes les Imputations qui s\'y rattachent', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, activiteId, imputationId } = await creerProjetActiviteImputation(
      app,
      adminToken,
      userToken,
      utilisateurId,
    );

    await request(app)
      .delete(`/api/projets/${projetId}/activites/${activiteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const acces = await request(app)
      .patch(`/api/imputations/${imputationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(acces.status).toBe(404);
  });

  test('le retrait d\'affectation d\'un Utilisateur à un Projet ne supprime pas ses Imputations passées', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, imputationId } = await creerProjetActiviteImputation(app, adminToken, userToken, utilisateurId);

    await request(app)
      .delete(`/api/projets/${projetId}/utilisateurs/${utilisateurId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const acces = await request(app)
      .patch(`/api/imputations/${imputationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(acces.status).toBe(200);
  });
});
