import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

// 192.168.1.16 est l'IP locale de votre machine (trouvée via ipconfig)
// Utile pour les appareils réels sur le même WiFi et les émulateurs.
const LOCAL_IP = "192.168.1.13";

const BASE_URL = Platform.OS === "android" 
  ? `http://${LOCAL_IP}:3000/api` 
  : `http://${LOCAL_IP}:3000/api`; // Ou localhost pour le simulateur iOS

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
