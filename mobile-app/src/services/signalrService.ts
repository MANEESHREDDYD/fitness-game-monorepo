import * as signalR from "@microsoft/signalr";

export const signalrService = {
  async connect(
    matchId: string,
    negotiate: { url: string; accessToken: string },
    handlers: {
      onMatchState: (payload: any) => void;
      onChat: (payload: any) => void;
    }
  ) {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiate.url, { accessTokenFactory: () => negotiate.accessToken })
      .withAutomaticReconnect()
      .build();

    connection.on("matchState", handlers.onMatchState);
    connection.on("matchChat", handlers.onChat);

    await connection.start();

    return {
      connection,
      connectionId: connection.connectionId || ""
    };
  }
};
