import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://threed-veiwer.onrender.com').replace(/\/$/, '');
export { API_BASE_URL };

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 120000, // 2 minutes
});

// Upload a 3D model file
export const uploadModel = async (file) => {
  const formData = new FormData();
  formData.append('model', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Save viewer settings
export const saveSettings = async (settings) => {
  const response = await api.post('/settings', settings);
  return response.data;
};

// Fetch viewer settings
export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Fetch uploads list
export const fetchUploads = async () => {
  const response = await api.get('/upload');
  return response.data;
};

export default api;
