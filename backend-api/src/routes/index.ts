import { Router } from "express";
import { matchesRouter } from "./matches";
import { parksRouter } from "./parks";
import { usersRouter } from "./users";

export const router = Router();

router.use("/matches", matchesRouter);
router.use("/parks", parksRouter);
router.use("/users", usersRouter);
