import { configureStore } from '@reduxjs/toolkit';
import { mastersApi } from '../entities/masters/mastersApi'; // you’ll create next

export const store = configureStore({
  reducer: {
    [mastersApi.reducerPath]: mastersApi.reducer,
  },
  middleware: (gDM) => gDM().concat(
  mastersApi.middleware
  ),
});
