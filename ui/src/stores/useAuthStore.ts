import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  // Personal info
  bio?: string;
  birthday?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  jobTitle?: string;
  // Church info
  homeChurch?: any;
  churchRole?: string;
  membershipDate?: string;
  // Settings
  notificationRadius?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('user_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        set({ 
          token, 
          user: JSON.parse(userData), 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Erreur initialisation Auth:', error);
      set({ isLoading: false });
    }
  },
}));
