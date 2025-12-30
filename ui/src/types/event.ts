export interface User {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string;
  startDatetime: string;
  endDatetime: string;
  imageUrl: string | null;
  
  organizer: User;
  organization?: Organization;
  
  // UI-only or relationship counts
  participantsCount?: number;
  isFavorited?: boolean;
  isParticipating?: boolean;
  distance?: string;
  
  // Legacy or simplified fields used in some components
  org?: string; 
  participants?: number | User[];
}
