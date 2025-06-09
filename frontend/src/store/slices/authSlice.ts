import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../types';
import { authAPI } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Check if user is logged in from localStorage
const token = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
if (token && storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser && parsedUser.id) {
      initialState.isAuthenticated = true;
      initialState.user = parsedUser;
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;

// Đăng nhập admin
export const loginAdmin = (username: string, password: string): AppThunk => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const response = await authAPI.login(username, password, true);
    const user = {
      id: response.username,
      name: response.username,
      email: '',
      isAdmin: response.role === 'admin',
    };
    // Lưu token và user vào localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch(loginSuccess({ user, token: response.token }));
  } catch (error) {
    dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

// Đăng nhập student
export const loginStudent = (username: string, password: string): AppThunk => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const response = await authAPI.login(username, password, false);
    const user = {
      id: response.username,
      name: response.username,
      email: '',
      isAdmin: response.role === 'admin',
    };
    // Lưu token và user vào localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch(loginSuccess({ user, token: response.token }));
  } catch (error) {
    dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

// Logout and remove from localStorage
export const logoutUser = (): AppThunk => (dispatch) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  dispatch(logout());
};

export default authSlice.reducer;