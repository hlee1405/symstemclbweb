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
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
  },
});

export const { addAlert, removeAlert } = alertSlice.actions;

// Trợ giúp tạo và tự động xóa cảnh báo
export const setAlert = (
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' = 'info', 
  timeout = 5000
): AppThunk => (dispatch) => {
  const id = uuidv4();
  dispatch(addAlert({ id, message, type }));
  
  setTimeout(() => {
    dispatch(removeAlert(id));
  }, timeout);
  
  return id;
};

export default alertSlice.reducer;