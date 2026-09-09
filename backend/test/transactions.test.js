const mongoose = require('mongoose');
const Imputation = require('../src/models/Imputation');

// Ces tests prouvent que l'infrastructure Mongo (replica set à un nœud, voir
// jest.setup.js) supporte bien les transactions multi-documents Mongoose, requises
// par les tickets 06 (Scission) et 07 (relancer). Les écritures ci-dessous ne portent
// aucune signification métier : elles servent uniquement à démontrer le mécanisme.

function idsFictifs() {
  return {
    utilisateurId: new mongoose.Types.ObjectId(),
    projetId: new mongoose.Types.ObjectId(),
    activiteId: new mongoose.Types.ObjectId(),
  };
}

describe('Transactions Mongoose (replica set)', () => {
  test('une transaction valide committe les deux écritures', async () => {
    const { utilisateurId, projetId, activiteId } = idsFictifs();

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Imputation.create(
          [{ utilisateurId, projetId, activiteId, heureDebut: new Date('2024-01-01T08:00:00Z'), heureFin: new Date('2024-01-01T09:00:00Z') }],
          { session }
        );
        await Imputation.create(
          [{ utilisateurId, projetId, activiteId, heureDebut: new Date('2024-01-01T09:00:00Z'), heureFin: new Date('2024-01-01T10:00:00Z') }],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    const imputations = await Imputation.find({ utilisateurId });
    expect(imputations).toHaveLength(2);
  });

  test('un échec sur la seconde écriture annule la première (tout-ou-rien)', async () => {
    const { utilisateurId, projetId, activiteId } = idsFictifs();

    const session = await mongoose.startSession();
    let erreurCapturee = null;
    try {
      await session.withTransaction(async () => {
        await Imputation.create(
          [{ utilisateurId, projetId, activiteId, heureDebut: new Date('2024-02-01T08:00:00Z'), heureFin: new Date('2024-02-01T09:00:00Z') }],
          { session }
        );
        throw new Error('Échec volontaire de la seconde écriture');
      });
    } catch (erreur) {
      erreurCapturee = erreur;
    } finally {
      await session.endSession();
    }

    expect(erreurCapturee).not.toBeNull();
    expect(erreurCapturee.message).toBe('Échec volontaire de la seconde écriture');

    const imputations = await Imputation.find({ utilisateurId });
    expect(imputations).toHaveLength(0);
  });
});
