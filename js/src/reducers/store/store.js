// src/reducers/store/store.js
import { configureStore } from '@reduxjs/toolkit';

// --- Core imports that MUST exist ---
import { mastersApi } from '../features/masters/mastersApi';
import { carRequestApi } from '../features/CarForm/carRequestApi';
import carFormReducer from '../features/CarForm/carFormSlice';

// Build reducer object dynamically
const reducers = {
  // Core reducers (always present)
  [mastersApi.reducerPath]: mastersApi.reducer,
  [carRequestApi.reducerPath]: carRequestApi.reducer,
  carForm: carFormReducer,
};

const middlewares = [

  mastersApi.middleware,
  carRequestApi.middleware,
];


export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...middlewares),
})