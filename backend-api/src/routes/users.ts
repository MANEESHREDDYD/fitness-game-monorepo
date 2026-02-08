import { Router } from "express";
import { eventService } from "../services/eventService";

export const usersRouter = Router();

const getUserId = (req: any) => {
  const header = req.headers["x-user-id"];
  return typeof header === "string" && header.length > 0 ? header : "anonymous";
};

usersRouter.post("/signup", async (req, res) => {
  const userId = getUserId(req);
  await eventService.recordEvent("USER_SIGNED_UP", userId, {});
  res.json({ ok: true });
});

usersRouter.post("/profile/complete", async (req, res) => {
  const userId = getUserId(req);
  await eventService.recordEvent("PROFILE_COMPLETED", userId, {});
  res.json({ ok: true });
});

usersRouter.post("/friends/add", async (req, res) => {
  const userId = getUserId(req);
  const { friendId } = req.body || {};
  await eventService.recordEvent("FRIEND_ADDED", userId, { friendId });
  res.json({ ok: true });
});

usersRouter.post("/stats", async (req, res) => {
  const userId = getUserId(req);
  const { distance, calories, matchId, parkId } = req.body || {};
  await eventService.recordEvent("SESSION_STATS_RECORDED", userId, {
    distance,
    calories,
    matchId,
    parkId
  });
  res.json({ ok: true });
});
