import axios from 'axios';

// In production, VITE_API_URL points to the Render backend.
// In development, Vite proxy forwards /api to localhost:5000.
const API_URL = import.meta.env.VITE_API_URL || 'https://threed-veiwer.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
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
