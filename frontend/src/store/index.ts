import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import equipmentReducer from './slices/equipmentSlice';
import requestReducer from './slices/requestSlice';
import alertReducer from './slices/alertSlice';
import notificationReadReducer from './slices/notificationReadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    equipment: equipmentReducer,
    request: requestReducer,
    alert: alertReducer,
    notificationRead: notificationReadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;