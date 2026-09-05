const request = require('supertest');
const { creerApp } = require('../src/app');
const { ensureAdminBootstrap } = require('../src/services/bootstrap');

async function demarrerAppEtBootstrap() {
  await ensureAdminBootstrap();
  return creerApp();
}

async function connecterAdmin(app, nouveauMotDePasse = 'nouveauMotDePasseAdmin') {
  const connexion = await request(app).post('/api/auth/login').send({ login: 'admin', motDePasse: 'admin' });

  const tokenTemporaire = connexion.body.token;
  await request(app)
    .post('/api/auth/changer-mot-de-passe')
    .set('Authorization', `Bearer ${tokenTemporaire}`)
    .send({ motDePasseActuel: 'admin', nouveauMotDePasse });

  const reconnexion = await request(app)
    .post('/api/auth/login')
    .send({ login: 'admin', motDePasse: nouveauMotDePasse });

  return { token: reconnexion.body.token, utilisateur: reconnexion.body.utilisateur };
}

async function creerEtConnecterUtilisateur(app, adminToken, login, nom = '', nouveauMotDePasse = 'motDePasse123') {
  const creation = await request(app)
    .post('/api/utilisateurs')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ login, nom });

  const connexionTemporaire = await request(app)
    .post('/api/auth/login')
    .send({ login, motDePasse: login });

  const tokenTemporaire = connexionTemporaire.body.token;
  await request(app)
    .post('/api/auth/changer-mot-de-passe')
    .set('Authorization', `Bearer ${tokenTemporaire}`)
    .send({ motDePasseActuel: login, nouveauMotDePasse });

  const reconnexion = await request(app).post('/api/auth/login').send({ login, motDePasse: nouveauMotDePasse });

  return {
    token: reconnexion.body.token,
    utilisateur: reconnexion.body.utilisateur,
    id: creation.body.id,
  };
}

module.exports = { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur };
