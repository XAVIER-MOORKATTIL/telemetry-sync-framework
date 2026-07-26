import { createSlice } from '@reduxjs/toolkit';

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: {
    connectionStatus: 'DISCONNECTED',
    metrics: [],
  },
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    telemetryReceived: (state, action) => {
      // Unshift new incoming telemetry event to top of stream
      state.metrics.unshift(action.payload);
    },
  },
});

export const { setConnectionStatus, telemetryReceived } = telemetrySlice.actions;
export default telemetrySlice.reducer;