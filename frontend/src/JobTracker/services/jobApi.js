import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${backendUrl}/api`;

const jobApi = axios.create({ baseURL: API_BASE });

jobApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Jobs API ───────────────────────────────────────────────
export const getJobs        = (params = {}) => jobApi.get('/jobs', { params });
export const seedJobs       = ()            => jobApi.post('/jobs/seed');
export const createJob      = (data)        => jobApi.post('/jobs', data);
export const updateJob      = (id, data)    => jobApi.put(`/jobs/${id}`, data);
export const deleteJob      = (id)          => jobApi.delete(`/jobs/${id}`);
export const updateStatus   = (id, status)  => jobApi.patch(`/jobs/${id}/status`, { status });
export const updateTags     = (id, tags)    => jobApi.patch(`/jobs/${id}/tags`, { tags });
export const updateReminder = (id, followUpDate) =>
  jobApi.patch(`/jobs/${id}/reminder`, { followUpDate });

export default jobApi;
