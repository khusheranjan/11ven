import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/me', data);

// Assets
export const getAssets = (params) => api.get('/assets', { params });
export const getCategories = () => api.get('/assets/categories');
export const uploadAsset = (formData) => api.post('/assets', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

// Designs
export const saveDesign = (data) => api.post('/designs', data);
export const getDesigns = () => api.get('/designs');
export const getDesign = (id) => api.get(`/designs/${id}`);
export const updateDesign = (id, data) => api.patch(`/designs/${id}`, data);
export const uploadImage = (formData) => api.post('/designs/upload-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// User Uploads
export const getUserUploads = (params) => api.get('/uploads', { params });
export const deleteUpload = (id) => api.delete(`/uploads/${id}`);
export const removeBackground = (id) => api.post(`/uploads/${id}/remove-background`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getAllOrders = (params) => api.get('/orders/admin/all', { params });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// Payments
export const createPayment = (orderId) => api.post('/payments/create', { orderId });
export const verifyPayment = (data) => api.post('/payments/verify', data);

export default api;
