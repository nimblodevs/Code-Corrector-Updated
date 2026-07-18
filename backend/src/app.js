import compression from "compression";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { notFound, errorHandler } from "./middlewares/errorHandlers.js";

const app = express();

const allowedOrigins = env.corsOrigin
  ? env.corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : !env.isProduction,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProduction ? 300 : 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));
app.use(pinoHttp({ logger }));
app.use(morgan(env.isProduction ? "combined" : "dev", {
  stream: { write: (message) => logger.info(message.trim()) },
}));

app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

export default app;
