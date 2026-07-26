import { configureStore } from '@reduxjs/toolkit';
import telemetryReducer from './telemetrySlice';

export const store = configureStore({
  reducer: {
    telemetry: telemetryReducer,
  },
});