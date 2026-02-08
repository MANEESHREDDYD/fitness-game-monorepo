export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Matches: undefined;
  Profile: undefined;
};

export type MatchesStackParamList = {
  MatchesHome: undefined;
  CreateMatch: undefined;
  JoinMatch: undefined;
  Lobby: { matchId: string };
  InMatch: { matchId: string };
};
