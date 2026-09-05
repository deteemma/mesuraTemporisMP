const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

describe('Gestion des Projets et affectation d\'équipe', () => {
  test('un Administrateur peut créer un Projet avec le statut actif par défaut', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);

    const creation = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Alpha' });

    expect(creation.status).toBe(201);
    expect(creation.body.statut).toBe('actif');
  });

  test('un Administrateur peut affecter et retirer un Utilisateur d\'un Projet', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const creation = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Alpha' });
    const projetId = creation.body.id;

    const affectation = await request(app)
      .post(`/api/projets/${projetId}/utilisateurs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ utilisateurId });
    expect(affectation.status).toBe(200);
    expect(affectation.body.utilisateursAffectes).toContain(utilisateurId);

    const retrait = await request(app)
      .delete(`/api/projets/${projetId}/utilisateurs/${utilisateurId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(retrait.status).toBe(200);
    expect(retrait.body.utilisateursAffectes).not.toContain(utilisateurId);
  });

  test('un Administrateur peut supprimer un Projet', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);

    const creation = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Alpha' });
    const projetId = creation.body.id;

    const suppression = await request(app)
      .delete(`/api/projets/${projetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suppression.status).toBe(204);
  });

  test('un Utilisateur ne voit que les Projets sur lesquels il est affecté', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const projetAffecte = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Affecté' });
    await request(app)
      .post(`/api/projets/${projetAffecte.body.id}/utilisateurs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ utilisateurId });

    await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Non Affecté' });

    const liste = await request(app).get('/api/projets').set('Authorization', `Bearer ${userToken}`);
    expect(liste.status).toBe(200);
    expect(liste.body).toHaveLength(1);
    expect(liste.body[0].nom).toBe('Projet Affecté');
  });

  test('un Utilisateur non affecté à un Projet ne peut pas y accéder', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const creation = await request(app)
      .post('/api/projets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Projet Alpha' });

    const acces = await request(app)
      .get(`/api/projets/${creation.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(acces.status).toBe(403);
  });
});
