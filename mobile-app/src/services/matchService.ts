import { apiClient } from "./apiClient";

export const matchService = {
  async createMatch(parkId: string, teamSize: number) {
    const response = await apiClient.post("/matches", { parkId, teamSize });
    return response.data;
  },
  async joinMatch(matchId: string, displayName: string, teamId: string) {
    const response = await apiClient.post(`/matches/${matchId}/join`, {
      displayName,
      teamId
    });
    return response.data;
  },
  async joinByCode(code: string, displayName: string, teamId: string) {
    const response = await apiClient.post("/matches/join-by-code", {
      code,
      displayName,
      teamId
    });
    return response.data;
  },
  async startMatch(matchId: string) {
    const response = await apiClient.post(`/matches/${matchId}/start`);
    return response.data;
  },
  async getMatch(matchId: string) {
    const response = await apiClient.get(`/matches/${matchId}`);
    return response.data;
  },
  async captureZone(matchId: string, zoneId: string) {
    const response = await apiClient.post(`/matches/${matchId}/capture-zone`, { zoneId });
    return response.data;
  },
  async negotiate(matchId: string) {
    const response = await apiClient.get(`/matches/${matchId}/negotiate`);
    return response.data;
  },
  async sendChat(matchId: string, message: string) {
    const response = await apiClient.post(`/matches/${matchId}/chat`, { message });
    return response.data;
  },
  async joinGroup(matchId: string, connectionId: string) {
    const response = await apiClient.post(`/matches/${matchId}/join-group`, { connectionId });
    return response.data;
  },
  async getZones(parkId: string) {
    const response = await apiClient.get(`/parks/${parkId}/zones`);
    return response.data;
  }
};
