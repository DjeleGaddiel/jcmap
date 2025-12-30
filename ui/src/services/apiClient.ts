import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

// ===== CONFIGURATION =====
// URL de production (Render) - API déployée
const PRODUCTION_URL = "https://jcmap.onrender.com/api";

// URL de développement local
const LOCAL_IP = "192.168.1.13";
const DEV_URL = Platform.OS === "android" 
  ? `http://${LOCAL_IP}:3000/api` 
  : `http://${LOCAL_IP}:3000/api`;

// Sélection automatique de l'URL selon l'environnement
// __DEV__ est true en mode développement, false en production build
const BASE_URL = __DEV__ ? DEV_URL : PRODUCTION_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
