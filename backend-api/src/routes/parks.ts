import { Router } from "express";
import { matchService } from "../services/matchService";

export const parksRouter = Router();

parksRouter.get("/:parkId/zones", (req, res) => {
  const zones = matchService.getZonesForPark(req.params.parkId);
  res.json({ zones });
});
