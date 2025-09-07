import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const conectarBancoMock = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const desconectarBancoMock = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

export const limparBancoMock = async () => {
  const colecoes = mongoose.connection.collections;
  for (const key in colecoes) {
    await colecoes[key].deleteMany({});
  }
};
