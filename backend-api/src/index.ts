import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { router } from "./routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api", router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});
