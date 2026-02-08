import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MatchZone } from "../../types/match";

interface ZonesState {
  zones: MatchZone[];
}

const initialState: ZonesState = {
  zones: []
};

const zonesSlice = createSlice({
  name: "zones",
  initialState,
  reducers: {
    setZones(state, action: PayloadAction<MatchZone[]>) {
      state.zones = action.payload;
    }
  }
});

export const { setZones } = zonesSlice.actions;
export default zonesSlice.reducer;
