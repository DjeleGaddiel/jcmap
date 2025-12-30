import { Event } from "../types/event";
import apiClient from "./apiClient";

export const MOCK_EVENTS: Event[] = [
  // ... (Je garde les mocks pour le fallback en cas d'erreur réseau)
  { 
    id: "1", 
    title: "Évangélisation Place de la Gare", 
    type: "Rue", 
    startDatetime: new Date(2025, 10, 28, 14, 0).toISOString(),
    endDatetime: new Date(2025, 10, 28, 17, 0).toISOString(),
    address: "Place de la Gare, Paris",
    org: "Église Vie Nouvelle", 
    participants: 12, 
    latitude: 48.8575, 
    longitude: 2.3514, 
    description: "Distribution de tracts et témoignages personnels" 
  },
  { 
    id: "2", 
    title: "Croisade d'évangélisation", 
    type: "Croisade", 
    startDatetime: new Date(2025, 10, 29, 18, 0).toISOString(),
    endDatetime: new Date(2025, 10, 29, 21, 0).toISOString(),
    address: "Place de la République, Paris",
    org: "Mission Internationale", 
    participants: 45, 
    latitude: 48.8647,
    longitude: 2.3327, 
    description: "Grande soirée avec louange et prédication" 
  }
];

export const eventsApi = {
  findAll: async (params?: { search?: string; category?: string }): Promise<Event[]> => {
    try {
      const response = await apiClient.get("/events", { params });
      return response.data;
    } catch (error) {
      console.warn("Using fallback mock events:", error);
      return MOCK_EVENTS;
    }
  },

  findNearby: async (lat: number, lng: number, radius: number): Promise<Event[]> => {
    const response = await apiClient.get("/events/nearby", {
      params: { lat, lng, radius }
    });
    return response.data;
  },

  findOne: async (id: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const response = await apiClient.post("/events", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    const response = await apiClient.patch(`/events/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  join: async (id: string): Promise<Event> => {
    const response = await apiClient.post(`/events/${id}/join`);
    return response.data;
  },

  leave: async (id: string): Promise<Event> => {
    const response = await apiClient.post(`/events/${id}/leave`);
    return response.data;
  },

  toggleFavorite: async (id: string): Promise<{ favorited: boolean }> => {
    const response = await apiClient.post(`/events/${id}/favorite`);
    return response.data;
  },

  uploadImage: async (id: string, formData: FormData): Promise<Event> => {
    const response = await apiClient.post(`/events/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  // Récupérer les événements auxquels l'utilisateur actuel participe
  getMyParticipating: async (): Promise<Event[]> => {
    const response = await apiClient.get("/users/me/participating");
    return response.data;
  },

  // Récupérer les événements favoris de l'utilisateur actuel
  getMyFavorites: async (): Promise<Event[]> => {
    const response = await apiClient.get("/users/me/favorites");
    return response.data;
  },

  // Récupérer les événements organisés par l'utilisateur actuel
  getMyOrganized: async (): Promise<Event[]> => {
    const response = await apiClient.get("/users/me/organized");
    return response.data;
  }
};
