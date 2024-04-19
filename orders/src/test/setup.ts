import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { natsWrapper } from "../__mocks__/nats-wrapper";

jest.mock("../nats-wrapper", () => ({ natsWrapper }));

declare global {
  var signin: (userId?: string) => string[];
}

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "12345";
  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (userId?: string) => {
  const payload = {
    id: userId ?? "id",
    email: "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const sessionJSON = JSON.stringify({ jwt: token });

  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};
