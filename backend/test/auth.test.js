const request = require('supertest');
const { demarrerAppEtBootstrap } = require('./helpers');

describe('Authentification et amorçage de l\'Administrateur', () => {
  test('crée automatiquement le compte admin au premier démarrage', async () => {
    const app = await demarrerAppEtBootstrap();

    const connexion = await request(app).post('/api/auth/login').send({ login: 'admin', motDePasse: 'admin' });

    expect(connexion.status).toBe(200);
    expect(connexion.body.token).toBeDefined();
    expect(connexion.body.utilisateur.role).toBe('administrateur');
    expect(connexion.body.utilisateur.doitChangerMotDePasse).toBe(true);
  });

  test('refuse une connexion avec des identifiants invalides', async () => {
    const app = await demarrerAppEtBootstrap();

    const connexion = await request(app).post('/api/auth/login').send({ login: 'admin', motDePasse: 'mauvais' });

    expect(connexion.status).toBe(401);
  });

  test('bloque l\'accès au reste de l\'application tant que le mot de passe par défaut n\'a pas été changé', async () => {
    const app = await demarrerAppEtBootstrap();

    const connexion = await request(app).post('/api/auth/login').send({ login: 'admin', motDePasse: 'admin' });
    const token = connexion.body.token;

    const acces = await request(app).get('/api/projets').set('Authorization', `Bearer ${token}`);
    expect(acces.status).toBe(403);
  });

  test('permet de changer le mot de passe puis d\'accéder au reste de l\'application', async () => {
    const app = await demarrerAppEtBootstrap();

    const connexion = await request(app).post('/api/auth/login').send({ login: 'admin', motDePasse: 'admin' });
    const token = connexion.body.token;

    const changement = await request(app)
      .post('/api/auth/changer-mot-de-passe')
      .set('Authorization', `Bearer ${token}`)
      .send({ motDePasseActuel: 'admin', nouveauMotDePasse: 'nouveauMotDePasse' });
    expect(changement.status).toBe(200);
    expect(changement.body.utilisateur.doitChangerMotDePasse).toBe(false);

    const reconnexion = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin', motDePasse: 'nouveauMotDePasse' });
    const nouveauToken = reconnexion.body.token;

    const acces = await request(app).get('/api/projets').set('Authorization', `Bearer ${nouveauToken}`);
    expect(acces.status).toBe(200);
  });

  test('refuse l\'accès sans jeton', async () => {
    const app = await demarrerAppEtBootstrap();
    const acces = await request(app).get('/api/projets');
    expect(acces.status).toBe(401);
  });
});
