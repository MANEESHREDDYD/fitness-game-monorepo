import axios from "axios";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const groupForMatch = (matchId: string) => `match_${matchId}`;

const buildClientAccessToken = (userId: string) => {
  if (!env.signalr.endpoint || !env.signalr.accessKey) {
    return "";
  }

  const aud = `${env.signalr.endpoint}/client/?hub=${env.signalr.hubName}`;
  const key = Buffer.from(env.signalr.accessKey, "base64");
  return jwt.sign({ sub: userId, aud }, key, { expiresIn: "1h" });
};

const buildServerAccessToken = () => {
  if (!env.signalr.endpoint || !env.signalr.accessKey) {
    return "";
  }

  const aud = `${env.signalr.endpoint}/api/v1/hubs/${env.signalr.hubName}`;
  const key = Buffer.from(env.signalr.accessKey, "base64");
  return jwt.sign({ aud }, key, { expiresIn: "1h" });
};

const postToGroup = async (matchId: string, target: string, payload: unknown) => {
  if (!env.signalr.endpoint || !env.signalr.accessKey) {
    return;
  }

  const token = buildServerAccessToken();
  const url = `${env.signalr.endpoint}/api/v1/hubs/${env.signalr.hubName}/groups/${groupForMatch(matchId)}/:send`;
  await axios.post(
    url,
    {
      target,
      arguments: [payload]
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    }
  );
};

const addConnectionToGroup = async (matchId: string, connectionId: string) => {
  if (!env.signalr.endpoint || !env.signalr.accessKey) {
    return;
  }

  const token = buildServerAccessToken();
  const url = `${env.signalr.endpoint}/api/v1/hubs/${env.signalr.hubName}/groups/${groupForMatch(matchId)}/connections/${connectionId}`;
  await axios.put(url, null, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 5000
  });
};

export const signalrService = {
  groupForMatch,
  getClientAccessInfo(matchId: string, userId: string) {
    return {
      hub: env.signalr.hubName,
      group: groupForMatch(matchId),
      url: `${env.signalr.endpoint}/client/?hub=${env.signalr.hubName}`,
      accessToken: buildClientAccessToken(userId)
    };
  },
  async broadcastMatchState(matchId: string, state: unknown) {
    await postToGroup(matchId, "matchState", state);
  },
  async broadcastChatMessage(matchId: string, message: unknown) {
    await postToGroup(matchId, "matchChat", message);
  },
  async joinMatchGroup(matchId: string, connectionId: string) {
    await addConnectionToGroup(matchId, connectionId);
  }
};
