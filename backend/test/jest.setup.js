const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  // Replica set à un seul nœud : requis pour que les transactions multi-documents
  // Mongoose (session.startTransaction / withTransaction) fonctionnent, MongoDB ne
  // les supportant pas en topologie standalone.
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
