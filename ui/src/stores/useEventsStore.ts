import { create } from "zustand";

interface EventsState {
  registeredEventIds: string[];
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  registeredEventIds: [],
  registerForEvent: (eventId) => 
    set((state) => ({ 
      registeredEventIds: [...state.registeredEventIds, eventId] 
    })),
  unregisterFromEvent: (eventId) => 
    set((state) => ({ 
      registeredEventIds: state.registeredEventIds.filter(id => id !== eventId) 
    })),
  isRegistered: (eventId) => get().registeredEventIds.includes(eventId),
}));
