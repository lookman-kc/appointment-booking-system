import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => api.post("/auth/login", { email, password });
export const register = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");

export const createDoctor = (data) => api.post("/admin/doctors", data);
export const listDoctorsAdmin = () => api.get("/admin/doctors");
export const updateDoctor = (id, data) => api.patch(`/admin/doctors/${id}`, data);
export const setAvailability = (data) => api.post("/admin/availability", data);
export const updateAvailability = (id, data) => api.patch(`/admin/availability/${id}`, data);
export const listAvailability = (params) => api.get("/admin/availability", { params });
export const createBreak = (data) => api.post("/admin/breaks", data);
export const listBreaks = (params) => api.get("/admin/breaks", { params });
export const listPatients = () => api.get("/admin/patients");
export const listAppointmentsAdmin = (params) => api.get("/admin/appointments", { params });

export const listDoctorsPatient = () => api.get("/patient/doctors");
export const listSlots = (doctorId, date) => api.get(`/patient/doctors/${doctorId}/slots`, { params: { date } });
export const bookAppointment = (data) => api.post("/patient/appointments", data);
export const listMyAppointments = (params) => api.get("/patient/appointments", { params });
export const cancelAppointment = (id) => api.patch(`/patient/appointments/${id}/cancel`);

export default api;
