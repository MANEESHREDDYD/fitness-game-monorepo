export type MatchStatus = "waiting" | "active" | "finished";

export interface MatchPlayer {
  id: string;
  displayName: string;
  teamId: string;
}

export interface MatchZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusM: number;
  ownerTeamId?: string;
}

export interface MatchState {
  id: string;
  parkId: string;
  teamSize: number;
  code: string;
  status: MatchStatus;
  players: MatchPlayer[];
  zones: MatchZone[];
  scores: Record<string, number>;
  timerSecRemaining: number;
  lastUpdatedIso: string;
  creatorId?: string;
  startTime?: string;
  maxPlayers?: number;
}

export interface ChatMessage {
  senderId: string;
  message: string;
  sentAtIso: string;
}
