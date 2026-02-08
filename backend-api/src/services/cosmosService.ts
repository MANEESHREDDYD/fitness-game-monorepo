import { CosmosClient, Container } from "@azure/cosmos";
import { env } from "../config/env";

let client: CosmosClient | null = null;
let dbReady: Promise<void> | null = null;

const ensureClient = () => {
  if (!env.cosmos.connectionString) {
    return null;
  }
  if (!client) {
    client = new CosmosClient(env.cosmos.connectionString);
  }
  return client;
};

export const getContainer = async (name: string): Promise<Container | null> => {
  const cosmosClient = ensureClient();
  if (!cosmosClient) {
    return null;
  }

  if (!dbReady) {
    dbReady = (async () => {
      await cosmosClient.databases.createIfNotExists({ id: env.cosmos.dbName });
    })();
  }

  await dbReady;
  const { database } = await cosmosClient.database(env.cosmos.dbName).read();
  await database.containers.createIfNotExists({ id: name, partitionKey: "/userId" });
  return database.container(name);
};
