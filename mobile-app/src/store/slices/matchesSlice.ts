import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MatchState, ChatMessage } from "../../types/match";

interface MatchesState {
  currentMatchId: string | null;
  matchState: MatchState | null;
  chat: ChatMessage[];
  loading: boolean;
}

const initialState: MatchesState = {
  currentMatchId: null,
  matchState: null,
  chat: [],
  loading: false
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    setCurrentMatchId(state, action: PayloadAction<string | null>) {
      state.currentMatchId = action.payload;
    },
    setMatchState(state, action: PayloadAction<MatchState | null>) {
      state.matchState = action.payload;
    },
    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.chat.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearMatch(state) {
      state.currentMatchId = null;
      state.matchState = null;
      state.chat = [];
      state.loading = false;
    }
  }
});

export const {
  setCurrentMatchId,
  setMatchState,
  addChatMessage,
  setLoading,
  clearMatch
} = matchesSlice.actions;
export default matchesSlice.reducer;
