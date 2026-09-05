const request = require('supertest');
const { demarrerAppEtBootstrap, connecterAdmin, creerEtConnecterUtilisateur } = require('./helpers');

async function creerProjetAffecte(app, adminToken, utilisateurId) {
  const creation = await request(app)
    .post('/api/projets')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nom: 'Projet Alpha' });
  await request(app)
    .post(`/api/projets/${creation.body.id}/utilisateurs`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ utilisateurId });
  return creation.body.id;
}

describe('Chronomètre et création d\'Activité à la volée', () => {
  test('un Utilisateur peut démarrer un chronomètre sur une Activité existante', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const projetId = await creerProjetAffecte(app, adminToken, utilisateurId);

    const activite = await request(app)
      .post(`/api/projets/${projetId}/activites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: 'Développement' });

    const demarrage = await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId, activiteId: activite.body.id });

    expect(demarrage.status).toBe(201);
    expect(demarrage.body.heureFin).toBeNull();
    expect(demarrage.body.heureDebut).toBeDefined();
  });

  test('un Utilisateur peut créer une nouvelle Activité à la volée au démarrage', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const projetId = await creerProjetAffecte(app, adminToken, utilisateurId);

    const demarrage = await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId, nomNouvelleActivite: 'Nouvelle tâche' });

    expect(demarrage.status).toBe(201);

    const activites = await request(app)
      .get(`/api/projets/${projetId}/activites`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(activites.body.some((a) => a.nom === 'Nouvelle tâche')).toBe(true);
  });

  test('le serveur refuse de démarrer un second chronomètre si un premier est déjà actif', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const projetId = await creerProjetAffecte(app, adminToken, utilisateurId);

    await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId, nomNouvelleActivite: 'Tâche 1' });

    const secondDemarrage = await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId, nomNouvelleActivite: 'Tâche 2' });

    expect(secondDemarrage.status).toBe(409);
  });

  test('arrêter le chronomètre renseigne heureFin', async () => {
    const app = await demarrerAppEtBootstrap();
    const { token: adminToken } = await connecterAdmin(app);
    const { token: userToken, id: utilisateurId } = await creerEtConnecterUtilisateur(app, adminToken, 'jdupont');
    const projetId = await creerProjetAffecte(app, adminToken, utilisateurId);

    await request(app)
      .post('/api/imputations/chrono/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projetId, nomNouvelleActivite: 'Tâche 1' });

    const arret = await request(app)
      .post('/api/imputations/chrono/stop')
      .set('Authorization', `Bearer ${userToken}`);

    expect(arret.status).toBe(200);
    expect(arret.body.heureFin).not.toBeNull();

    const statut = await request(app)
      .get('/api/imputations/chrono/status')
      .set('Authorization', `Bearer ${userToken}`);
    expect(statut.body).toBeNull();
  });
});
