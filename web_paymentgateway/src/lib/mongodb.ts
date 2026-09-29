import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) {
  throw new Error("MONGODB_URI belum diatur");
}

const client = new MongoClient(uri);

const clientPromise = client.connect();

export async function connectToDatabase() {
  await clientPromise;
  return client.db(dbName);
}
