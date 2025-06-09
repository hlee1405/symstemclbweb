import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../types';
import { notificationReadAPI } from '../../services/api';

interface NotificationReadState {
  readIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationReadState = {
  readIds: [],
  loading: false,
  error: null,
};

const notificationReadSlice = createSlice({
  name: 'notificationRead',
  initialState,
  reducers: {
    fetchReadStart: (state) => { state.loading = true; state.error = null; },
    fetchReadSuccess: (state, action: PayloadAction<string[]>) => {
      state.readIds = action.payload;
      state.loading = false;
    },
    fetchReadFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    markReadLocal: (state, action: PayloadAction<string[]>) => {
      state.readIds = Array.from(new Set([...state.readIds, ...action.payload]));
    }
  }
});

export const {
  fetchReadStart, fetchReadSuccess, fetchReadFailure, markReadLocal
} = notificationReadSlice.actions;

// Async actions
export const fetchReadNotifications = (userId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchReadStart());
    const ids = await notificationReadAPI.getRead(userId);
    dispatch(fetchReadSuccess(ids));
  } catch (error) {
    dispatch(fetchReadFailure(error instanceof Error ? error.message : 'Lỗi lấy trạng thái đã đọc'));
  }
};

export const markNotificationsRead = (userId: string, notificationIds: string[]): AppThunk => async (dispatch) => {
  try {
    await notificationReadAPI.markRead(userId, notificationIds);
    dispatch(markReadLocal(notificationIds));
  } catch (error) {
    // Có thể xử lý lỗi nếu muốn
  }
};

export default notificationReadSlice.reducer; 