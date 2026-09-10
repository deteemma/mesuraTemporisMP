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

  test('un Utilisateur peut modifier heureDebut indépendamment de heureFin', async () => {
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heureDebut: '2026-01-05T08:30:00.000Z' });

    expect(modification.status).toBe(200);
    expect(modification.body.heureDebut).toBe('2026-01-05T08:30:00.000Z');
    expect(modification.body.heureFin).toBe('2026-01-05T10:00:00.000Z');
  });

  test('une édition de heureFin qui ferait franchir minuit vers le lendemain déclenche une Scission automatique', async () => {
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heureFin: '2026-01-05T08:00:00.000Z' });

    expect(modification.status).toBe(200);
    expect(modification.body.heureDebut).toBe('2026-01-05T09:00:00.000Z');
    // L'Imputation d'origine est tronquée à la fin de sa journée.
    expect(modification.body.heureFin).toBe('2026-01-05T23:59:59.999Z');

    // La réponse porte la nouvelle Imputation créée par la Scission.
    expect(modification.body.scission).toBeTruthy();
    expect(modification.body.scission.utilisateurId).toBe(utilisateurId);
    expect(modification.body.scission.projetId).toBe(projetId);
    expect(modification.body.scission.activiteId).toBe(activiteId);
    expect(modification.body.scission.heureDebut).toBe('2026-01-06T00:00:00.000Z');
    expect(modification.body.scission.heureFin).toBe('2026-01-06T08:00:00.000Z');

    // Les deux écritures ont bien été effectuées (atomicité de la transaction) : les
    // deux Imputations existent, chacune dans la journée qui lui correspond.
    const relectureJourOrigine = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date: '2026-01-05' });
    const imputationTronquee = relectureJourOrigine.body.find((i) => i.id === imputation.body.id);
    expect(imputationTronquee.heureFin).toBe('2026-01-05T23:59:59.999Z');

    const relectureLendemain = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date: '2026-01-06' });
    expect(relectureLendemain.body).toHaveLength(1);
    expect(relectureLendemain.body[0].id).toBe(modification.body.scission.id);
    expect(relectureLendemain.body[0].heureDebut).toBe('2026-01-06T00:00:00.000Z');
    expect(relectureLendemain.body[0].heureFin).toBe('2026-01-06T08:00:00.000Z');
  });

  test('une édition de heureDebut qui ferait franchir minuit vers la veille déclenche une Scission automatique', async () => {
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heureDebut: '2026-01-05T23:50:00.000Z' });

    expect(modification.status).toBe(200);
    // L'Imputation d'origine est tronquée au début de sa journée.
    expect(modification.body.heureDebut).toBe('2026-01-05T00:00:00.000Z');
    expect(modification.body.heureFin).toBe('2026-01-05T10:00:00.000Z');

    // La réponse porte la nouvelle Imputation créée par la Scission.
    expect(modification.body.scission).toBeTruthy();
    expect(modification.body.scission.utilisateurId).toBe(utilisateurId);
    expect(modification.body.scission.projetId).toBe(projetId);
    expect(modification.body.scission.activiteId).toBe(activiteId);
    expect(modification.body.scission.heureDebut).toBe('2026-01-04T23:50:00.000Z');
    expect(modification.body.scission.heureFin).toBe('2026-01-04T23:59:59.999Z');

    // Les deux écritures ont bien été effectuées (atomicité de la transaction) : les
    // deux Imputations existent, chacune dans la journée qui lui correspond.
    const relectureJourOrigine = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date: '2026-01-05' });
    const imputationTronquee = relectureJourOrigine.body.find((i) => i.id === imputation.body.id);
    expect(imputationTronquee.heureDebut).toBe('2026-01-05T00:00:00.000Z');

    const relectureVeille = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date: '2026-01-04' });
    expect(relectureVeille.body).toHaveLength(1);
    expect(relectureVeille.body[0].id).toBe(modification.body.scission.id);
    expect(relectureVeille.body[0].heureDebut).toBe('2026-01-04T23:50:00.000Z');
    expect(relectureVeille.body[0].heureFin).toBe('2026-01-04T23:59:59.999Z');
  });

  test('une modification simultanée de heureDebut et heureFin qui inverserait leur ordre est refusée (direction de Scission ambiguë)', async () => {
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
      .set('Authorization', `Bearer ${userToken}`)
      .send({ heureDebut: '2026-01-05T23:50:00.000Z', heureFin: '2026-01-05T09:30:00.000Z' });

    expect(modification.status).toBeGreaterThanOrEqual(400);
    expect(modification.status).toBeLessThan(500);

    const relecture = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ date: '2026-01-05' });
    const imputationInchangee = relecture.body.find((i) => i.id === imputation.body.id);
    expect(imputationInchangee.heureDebut).toBe('2026-01-05T09:00:00.000Z');
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

  test('un Utilisateur ne peut pas déclencher de Scission sur l\'Imputation d\'un autre Utilisateur', async () => {
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
      .send({ heureFin: '2026-01-05T08:00:00.000Z' });
    expect(modification.status).toBe(403);

    // Ni scission ni mutation : l'Imputation d'origine est inchangée, et rien n'a été créé le lendemain.
    const relectureJourOrigine = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken1}`)
      .query({ date: '2026-01-05' });
    const imputationInchangee = relectureJourOrigine.body.find((i) => i.id === imputation.body.id);
    expect(imputationInchangee.heureFin).toBe('2026-01-05T10:00:00.000Z');

    const relectureLendemain = await request(app)
      .get('/api/imputations')
      .set('Authorization', `Bearer ${userToken1}`)
      .query({ date: '2026-01-06' });
    expect(relectureLendemain.body).toHaveLength(0);
  });
});
