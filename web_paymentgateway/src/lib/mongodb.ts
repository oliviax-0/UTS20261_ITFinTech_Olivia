import dns from "node:dns";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) {
  throw new Error("MONGODB_URI belum diatur");
}

// Disimpan di globalThis supaya hot reload di dev tidak membuat koneksi baru terus
const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

async function connect(): Promise<MongoClient> {
  try {
    return await new MongoClient(uri).connect();
  } catch (error) {
    // DNS jaringan (mis. hotspot) kadang gagal lookup SRV mongodb+srv://; coba lagi pakai DNS publik
    if (error instanceof Error && error.message.includes("querySrv")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      return await new MongoClient(uri).connect();
    }
    throw error;
  }
}

function getClient(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = connect().catch((error) => {
      // Jangan simpan koneksi yang gagal; request berikutnya akan mencoba lagi
      globalForMongo._mongoClientPromise = undefined;
      throw error;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export async function connectToDatabase() {
  const client = await getClient();
  return client.db(dbName);
}
