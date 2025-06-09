import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string, isAdmin: boolean = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const response = await api.post(endpoint, {
      username,
      password,
    });
    return response.data;
  },
};

// Equipment API
export const equipmentAPI = {
  getAll: async () => {
    const response = await api.get('/equipment/');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  create: async (equipmentData: any) => {
    const response = await api.post('/equipment/', equipmentData);
    return response.data;
  },
  update: async (id: string, equipmentData: any) => {
    const response = await api.put(`/equipment/${id}`, equipmentData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },
};

// Request API
export const requestAPI = {
  getAll: async () => {
    const response = await api.get('/request/');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/request/${id}`);
    return response.data;
  },
  create: async (requestData: any) => {
    const response = await api.post('/request/', requestData);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/request/${id}/status?status=${status}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/request/${id}`);
    return response.data;
  },
};

// Notification Read API
export const notificationReadAPI = {
  getRead: async (userId: string) => {
    const res = await api.get(`/notification-read/${userId}`);
    return res.data;
  },
  markRead: async (userId: string, notificationIds: string[]) => {
    const res = await api.post(`/notification-read/`, { userId, notificationIds });
    return res.data;
  }
}; 