import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { AppThunk } from '../../types';

export interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Omit<Alert, 'id'>>) => {
      const newAlert: Alert = {
        id: uuidv4(),
        ...action.payload,
      };
      state.alerts.push(newAlert);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
  },
});

export const { addAlert, removeAlert } = alertSlice.actions;

// Helper to create and auto-remove alerts
export const setAlert = (
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' = 'info', 
  timeout = 5000
): AppThunk => (dispatch) => {
  const id = uuidv4();
  dispatch(addAlert({ message, type, id }));
  
  setTimeout(() => {
    dispatch(removeAlert(id));
  }, timeout);
  
  return id;
};

export default alertSlice.reducer;