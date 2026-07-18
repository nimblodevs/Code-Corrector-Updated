import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

export default router;
