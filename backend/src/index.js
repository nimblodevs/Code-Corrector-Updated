import app from "./app.js";
import { connectMongoDB } from "./config/mongodb.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

async function start() {
  await connectMongoDB();

  app.listen(env.port, () => {
    logger.info({ port: env.port }, "API server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start API server");
  process.exit(1);
});
