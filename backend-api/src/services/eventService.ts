import { randomUUID } from "crypto";
import { getContainer } from "./cosmosService";

export type EventType =
  | "USER_SIGNED_UP"
  | "PROFILE_COMPLETED"
  | "FRIEND_ADDED"
  | "MATCH_STARTED"
  | "MATCH_FINISHED"
  | "ZONE_CAPTURED"
  | "SESSION_STATS_RECORDED";

interface EventDocument {
  id: string;
  userId: string;
  timestamp: string;
  eventType: EventType;
  data: Record<string, unknown>;
}

export const eventService = {
  async recordEvent(eventType: EventType, userId: string, data: Record<string, unknown>) {
    const container = await getContainer("Events");
    const document: EventDocument = {
      id: randomUUID(),
      userId,
      timestamp: new Date().toISOString(),
      eventType,
      data
    };

    if (!container) {
      console.log("Event (no Cosmos config):", document);
      return;
    }

    await container.items.create(document);
  }
};
