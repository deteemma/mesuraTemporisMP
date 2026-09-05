const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

describe('Gestion des comptes Utilisateur', () => {
  test('un Administrateur peut créer un Utilisateur avec un mot de passe temporaire égal au login', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);

    const creation = await request(app)
      .post('/api/utilisateurs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ login: 'jdupont', nom: 'Jean Dupont' });

    expect(creation.status).toBe(201);
    expect(creation.body.login).toBe('jdupont');
    expect(creation.body.doitChangerMotDePasse).toBe(true);

    const connexion = await request(app).post('/api/auth/login').send({ login: 'jdupont', motDePasse: 'jdupont' });
    expect(connexion.status).toBe(200);
  });

  test('le nouvel Utilisateur doit changer son mot de passe à la première connexion', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);

    await request(app)
      .post('/api/utilisateurs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ login: 'jdupont', nom: 'Jean Dupont' });

    const connexion = await request(app).post('/api/auth/login').send({ login: 'jdupont', motDePasse: 'jdupont' });
    const token = connexion.body.token;

    const acces = await request(app).get('/api/projets').set('Authorization', `Bearer ${token}`);
    expect(acces.status).toBe(403);
  });

  test('un Administrateur peut supprimer un Utilisateur', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);

    const { id } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const suppression = await request(app)
      .delete(`/api/utilisateurs/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(suppression.status).toBe(204);

    const connexion = await request(app).post('/api/auth/login').send({ login: 'jdupont', motDePasse: 'jdupont' });
    expect(connexion.status).toBe(401);
  });

  test('un Utilisateur non-Administrateur reçoit un refus sur les routes de gestion des Utilisateurs', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');

    const liste = await request(app).get('/api/utilisateurs').set('Authorization', `Bearer ${userToken}`);
    expect(liste.status).toBe(403);

    const creation = await request(app)
      .post('/api/utilisateurs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ login: 'autre', nom: 'Autre' });
    expect(creation.status).toBe(403);
  });
});
