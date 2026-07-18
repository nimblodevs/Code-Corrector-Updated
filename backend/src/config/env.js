import "dotenv/config";

const port = Number(process.env.PORT || 8080);

if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

export const env = {
  corsOrigin: process.env.CORS_ORIGIN || "",
  isProduction: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medicore_hms",
  nodeEnv: process.env.NODE_ENV || "development",
  port,
};
