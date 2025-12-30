import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushNotifications: boolean;
  locationServices: boolean;
  privacyMode: boolean;
  radius: number;
  setPushNotifications: (enabled: boolean) => void;
  setLocationServices: (enabled: boolean) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setRadius: (radius: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      locationServices: true,
      privacyMode: false,
      radius: 5,
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      setLocationServices: (locationServices) => set({ locationServices }),
      setPrivacyMode: (privacyMode) => set({ privacyMode }),
      setRadius: (radius) => set({ radius }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
