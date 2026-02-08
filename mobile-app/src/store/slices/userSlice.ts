import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  accessToken: string | null;
  profile: { id: string; name: string } | null;
}

const initialState: UserState = {
  accessToken: null,
  profile: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    clearSession(state) {
      state.accessToken = null;
      state.profile = null;
    },
    setProfile(state, action: PayloadAction<{ id: string; name: string }>) {
      state.profile = action.payload;
    }
  }
});

export const { setAccessToken, clearSession, setProfile } = userSlice.actions;
export default userSlice.reducer;
