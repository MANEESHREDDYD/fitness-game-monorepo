import { randomUUID } from "crypto";
import { MatchPlayer, MatchState, MatchZone, ChatMessage } from "../types/match";
import { signalrService } from "./signalrService";
import { eventService } from "./eventService";

interface CreateMatchInput {
  parkId: string;
  teamSize: number;
  creatorId: string;
}

interface JoinInput {
  id: string;
  displayName: string;
  teamId: string;
}

const DEFAULT_TIMER_SEC = 15 * 60;

const parkZones: Record<string, MatchZone[]> = {
  "central-park": [
    { id: "zone-a", name: "Zone A", lat: 40.785091, lng: -73.968285, radiusM: 60 },
    { id: "zone-b", name: "Zone B", lat: 40.7842, lng: -73.9665, radiusM: 55 },
    { id: "zone-c", name: "Zone C", lat: 40.7862, lng: -73.9691, radiusM: 50 }
  ]
};

export const matches = new Map<string, MatchState>();
const matchTimers = new Map<string, NodeJS.Timeout>();

const nowIso = () => new Date().toISOString();

const withUpdated = (match: MatchState): MatchState => ({
  ...match,
  lastUpdatedIso: nowIso()
});

const broadcast = async (match: MatchState) => {
  await signalrService.broadcastMatchState(match.id, match);
};

export const matchService = {
  createMatch({ parkId, teamSize, creatorId }: CreateMatchInput): MatchState {
    const id = randomUUID();
    const code = id.slice(0, 6).toUpperCase();
    const zones = (parkZones[parkId] || []).map((zone) => ({ ...zone }));

    const match: MatchState = {
      id,
      parkId,
      teamSize,
      maxPlayers: teamSize,
      code,
      status: "waiting",
      players: [],
      zones,
      scores: {
        blue: 0,
        red: 0
      },
      timerSecRemaining: DEFAULT_TIMER_SEC,
      lastUpdatedIso: nowIso(),
      creatorId,
      startTime: nowIso()
    };

    matches.set(id, match);
    return match;
  },

  getMatch(id: string) {
    return matches.get(id);
  },

  findMatchByCode(code: string) {
    const normalized = code.trim().toUpperCase();
    for (const match of matches.values()) {
      if (match.code === normalized) {
        return match;
      }
    }
    return undefined;
  },

  getZonesForPark(parkId: string) {
    return parkZones[parkId] || [];
  },

  joinMatch(id: string, player: JoinInput): MatchPlayer {
    const match = matches.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    const exists = match.players.find((p) => p.id === player.id);
    if (!exists) {
      match.players.push(player);
    }

    matches.set(id, withUpdated(match));
    return player;
  },

  async startMatch(id: string, userId: string) {
    const match = matches.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    match.status = "active";
    match.timerSecRemaining = DEFAULT_TIMER_SEC;
    matches.set(id, withUpdated(match));
    await broadcast(match);

    if (!matchTimers.has(id)) {
      const timer = setInterval(async () => {
        const current = matches.get(id);
        if (!current) {
          return;
        }
        current.timerSecRemaining = Math.max(0, current.timerSecRemaining - 5);
        matches.set(id, withUpdated(current));
        await broadcast(current);

        if (current.timerSecRemaining <= 0) {
          clearInterval(timer);
          matchTimers.delete(id);
          current.status = "finished";
          matches.set(id, withUpdated(current));
          await broadcast(current);

          await Promise.all(
            current.players.map((player) =>
              eventService.recordEvent("MATCH_FINISHED", player.id, {
                matchId: id,
                parkId: current.parkId
              })
            )
          );
        }
      }, 5000);

      matchTimers.set(id, timer);
    }

    await eventService.recordEvent("SESSION_STATS_RECORDED", userId, {
      matchId: id,
      parkId: match.parkId
    });

    return match;
  },

  async captureZone(id: string, zoneId: string, userId: string) {
    const match = matches.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    const zone = match.zones.find((z) => z.id === zoneId);
    if (!zone) {
      throw new Error("Zone not found");
    }

    const player = match.players.find((p) => p.id === userId);
    const teamId = player?.teamId || "blue";
    zone.ownerTeamId = teamId;
    match.scores[teamId] = (match.scores[teamId] || 0) + 1;

    matches.set(id, withUpdated(match));
    await broadcast(match);

    return match;
  },

  async sendChat(id: string, input: { senderId: string; message: string }) {
    const match = matches.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    const payload: ChatMessage = {
      senderId: input.senderId,
      message: input.message,
      sentAtIso: nowIso()
    };

    await signalrService.broadcastChatMessage(id, payload);
  }
};
