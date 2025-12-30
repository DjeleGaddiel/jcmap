import apiClient from "./apiClient";

export interface RegisterData {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  fullName: string;
}

export interface LoginData {
  login: string;
  password?: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch("/users/me", data);
    return response.data;
  },

  uploadAvatar: async (formData: FormData) => {
    const response = await apiClient.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete("/users/me/avatar");
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  // Admin methods
  findAll: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  findById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateRole: async (userId: string, role: string) => {
    const response = await apiClient.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  deleteUser: async (id: string, reason: string) => {
    const response = await apiClient.delete(`/users/${id}`, { data: { reason } });
    return response.data;
  }
};
