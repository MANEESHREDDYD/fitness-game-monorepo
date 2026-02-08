import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 3000),
  apiBaseUrl: process.env.API_BASE_URL || "",
  cosmos: {
    connectionString: process.env.COSMOS_CONNECTION || "",
    dbName: process.env.COSMOS_DB_NAME || "fitnessGame"
  },
  signalr: {
    endpoint: process.env.SIGNALR_ENDPOINT || "",
    accessKey: process.env.SIGNALR_ACCESS_KEY || "",
    hubName: process.env.SIGNALR_HUB_NAME || "match"
  },
  blobStorageUrl: process.env.BLOB_STORAGE_URL || "",
  notificationHubConnection: process.env.NOTIFICATION_HUB_CONNECTION || "",
  b2cConfig: process.env.B2C_CONFIG || ""
};
