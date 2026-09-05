const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

async function creerProjetActiviteAffectes(app, adminToken, utilisateurId) {
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
  return { projetId: projet.body.id, activiteId: activite.body.id };
}

describe('Saisie manuelle et modification/suppression d\'une Imputation', () => {
  test('un Utilisateur peut saisir manuellement une Imputation', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, activiteId } = await creerProjetActiviteAffectes(app, adminToken, utilisateurId);

    const creation = await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    expect(creation.status).toBe(201);
    expect(creation.body.heureFin).toBe('2026-01-05T10:00:00.000Z');
  });

  test('un Utilisateur peut modifier ses propres Imputations, y compris en créant un chevauchement', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, activiteId } = await creerProjetActiviteAffectes(app, adminToken, utilisateurId);

    const imputation1 = await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:30:00.000Z',
        heureFin: '2026-01-05T10:30:00.000Z',
      });

    const modification = await request(app)
      .patch(`/api/imputations/${imputation1.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heureFin: '2026-01-05T10:45:00.000Z' });

    expect(modification.status).toBe(200);
    expect(modification.body.heureFin).toBe('2026-01-05T10:45:00.000Z');
  });

  test('un Utilisateur peut supprimer une de ses Imputations', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, activiteId } = await creerProjetActiviteAffectes(app, adminToken, utilisateurId);

    const imputation = await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    const suppression = await request(app)
      .delete(`/api/imputations/${imputation.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(suppression.status).toBe(204);
  });

  test('un Administrateur peut modifier ou supprimer l\'Imputation d\'un autre Utilisateur', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { projetId, activiteId } = await creerProjetActiviteAffectes(app, adminToken, utilisateurId);

    const imputation = await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    const modification = await request(app)
      .patch(`/api/imputations/${imputation.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(modification.status).toBe(200);

    const suppression = await request(app)
      .delete(`/api/imputations/${imputation.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suppression.status).toBe(204);
  });

  test('un Utilisateur ne peut pas modifier/supprimer l\'Imputation d\'un autre Utilisateur', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken1, id: utilisateurId1 } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const { token: userToken2 } = await creerEtConnecterUtilisateur(app, adminToken, 'amartin');
    const { projetId, activiteId } = await creerProjetActiviteAffectes(app, adminToken, utilisateurId1);

    const imputation = await request(app)
      .post('/api/imputations')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        projetId,
        activiteId,
        heureDebut: '2026-01-05T09:00:00.000Z',
        heureFin: '2026-01-05T10:00:00.000Z',
      });

    const modification = await request(app)
      .patch(`/api/imputations/${imputation.body.id}`)
      .set('Authorization', `Bearer ${userToken2}`)
      .send({ heureFin: '2026-01-05T11:00:00.000Z' });
    expect(modification.status).toBe(403);

    const suppression = await request(app)
      .delete(`/api/imputations/${imputation.body.id}`)
      .set('Authorization', `Bearer ${userToken2}`);
    expect(suppression.status).toBe(403);
  });
});
