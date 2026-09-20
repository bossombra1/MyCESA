import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL;

if (!SERVER_URL) {
  throw new Error('EXPO_PUBLIC_API_URL est requis pour contacter le backend');
}
const BASE_URL = `${SERVER_URL}/api`;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;

// ── NOUVELLES FONCTIONS : NOTIFICATIONS CIBLÉES ─────────────────

export const getMyNotificationsCiblees = (page = 1) =>
  API.get(`/notifications/moi?page=${page}`);

export const getUnreadCountCible = () =>
  API.get('/notifications/moi/non-lues');

export const marquerLuCible = (id) =>
  API.put(`/notifications/moi/${id}/lire`);

export const marquerToutLuCible = () =>
  API.put('/notifications/moi/lire-tout');