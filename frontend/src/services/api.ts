import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm một trình chặn yêu cầu để thêm mã thông báo xác thực
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

// Thêm một bộ chặn phản hồi để xử lý hết hạn mã thông báo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Mã thông báo đã hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API xác thực
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

// API thiết bị
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

// Yêu cầu API
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

// API Đọc Thông báo
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