import { Router } from "express";
import { matchService } from "../services/matchService";
import { signalrService } from "../services/signalrService";
import { eventService } from "../services/eventService";

export const matchesRouter = Router();

const getUserId = (req: any) => {
  const header = req.headers["x-user-id"];
  return typeof header === "string" && header.length > 0 ? header : "anonymous";
};

matchesRouter.post("/", (req, res) => {
  const { parkId, teamSize } = req.body || {};
  const match = matchService.createMatch({
    parkId,
    teamSize: Number(teamSize || 2),
    creatorId: getUserId(req)
  });

  res.json(match);
});

matchesRouter.post("/:id/join", (req, res) => {
  const { id } = req.params;
  const { displayName, teamId } = req.body || {};
  const player = matchService.joinMatch(id, {
    id: getUserId(req),
    displayName: displayName || "Player",
    teamId: teamId || "blue"
  });

  res.json({ player, match: matchService.getMatch(id) });
});

matchesRouter.post("/join-by-code", (req, res) => {
  const { code, displayName, teamId } = req.body || {};
  const match = matchService.findMatchByCode(code || "");
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const player = matchService.joinMatch(match.id, {
    id: getUserId(req),
    displayName: displayName || "Player",
    teamId: teamId || "blue"
  });

  res.json({ player, match });
});

matchesRouter.post("/:id/start", async (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);
  const match = await matchService.startMatch(id, userId);
  await eventService.recordEvent("MATCH_STARTED", userId, {
    matchId: id,
    parkId: match.parkId
  });

  res.json(match);
});

matchesRouter.post("/:id/capture-zone", async (req, res) => {
  const { id } = req.params;
  const { zoneId } = req.body || {};
  const userId = getUserId(req);
  const result = await matchService.captureZone(id, zoneId, userId);

  await eventService.recordEvent("ZONE_CAPTURED", userId, {
    matchId: id,
    zoneId
  });

  res.json(result);
});

matchesRouter.post("/:id/chat", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body || {};
  const userId = getUserId(req);
  await matchService.sendChat(id, {
    senderId: userId,
    message: message || ""
  });

  res.json({ ok: true });
});

matchesRouter.post("/:id/join-group", async (req, res) => {
  const { id } = req.params;
  const { connectionId } = req.body || {};
  if (!connectionId) {
    res.status(400).json({ error: "connectionId is required" });
    return;
  }

  await signalrService.joinMatchGroup(id, connectionId);
  res.json({ ok: true });
});

matchesRouter.get("/:id", (req, res) => {
  const match = matchService.getMatch(req.params.id);
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  res.json(match);
});

matchesRouter.get("/:id/negotiate", (req, res) => {
  const { id } = req.params;
  const userId = getUserId(req);
  const negotiate = signalrService.getClientAccessInfo(id, userId);
  res.json(negotiate);
});
