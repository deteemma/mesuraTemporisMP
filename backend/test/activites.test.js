const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

async function creerProjetAffecte(app, adminToken, utilisateurId) {
  const creation = await request(app)
    .post('/api/projets')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nom: 'Projet Alpha' });
  if (utilisateurId) {
    await request(app)
      .post(`/api/projets/${creation.body.id}/utilisateurs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ utilisateurId });
  }
  return creation.body.id;
}

describe('Gestion des Activités d\'un Projet', () => {
  test('un Administrateur peut créer, renommer et supprimer une Activité', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const projetId = await creerProjetAffecte(app, adminToken);

    const creation = await request(app)
      .post(`/api/projets/${projetId}/activites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Développement' });
    expect(creation.status).toBe(201);
    expect(creation.body.projetId).toBe(projetId);

    const renommage = await request(app)
      .patch(`/api/projets/${projetId}/activites/${creation.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Développement backend' });
    expect(renommage.status).toBe(200);
    expect(renommage.body.nom).toBe('Développement backend');

    const suppression = await request(app)
      .delete(`/api/projets/${projetId}/activites/${creation.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suppression.status).toBe(204);
  });

  test('un Utilisateur non-Administrateur reçoit un refus sur les routes de gestion des Activités', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const projetId = await creerProjetAffecte(app, adminToken, utilisateurId);

    const creation = await request(app)
      .post(`/api/projets/${projetId}/activites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nom: 'Développement' });
    expect(creation.status).toBe(403);
  });
});
