import apiClient from "./apiClient";

export interface Organization {
  id: string;
  name: string;
  type?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  membersCount?: number;
  isVerified?: boolean;
  owner?: {
    id: string;
    fullName?: string;
  };
}

export const organizationsApi = {
  findAll: async (params?: { isVerified?: boolean; search?: string }): Promise<Organization[]> => {
    const response = await apiClient.get("/organizations", { params });
    return response.data;
  },

  findNearby: async (lat: number, lng: number, radius?: number): Promise<Organization[]> => {
    const response = await apiClient.get("/organizations/nearby", { 
      params: { lat, lng, radius } 
    });
    return response.data;
  },

  findOne: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data;
  },

  joinOrganization: async (organizationId: string) => {
    const response = await apiClient.post(`/organizations/${organizationId}/join`);
    return response.data;
  },

  leaveOrganization: async (organizationId: string) => {
    const response = await apiClient.post(`/organizations/${organizationId}/leave`);
    return response.data;
  },

  create: async (data: Partial<Organization>) => {
    const response = await apiClient.post("/organizations", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Organization>) => {
    const response = await apiClient.patch(`/organizations/${id}`, data);
    return response.data;
  },

  uploadLogo: async (id: string, formData: FormData) => {
    const response = await apiClient.post(`/organizations/${id}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  
  delete: async (id: string, reason: string) => {
    const response = await apiClient.delete(`/organizations/${id}`, { data: { reason } });
    return response.data;
  },

  getMembers: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/organizations/${id}/members`);
    return response.data;
  },
};
