import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

interface UserResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserFilters {
  role?: string;
  page?: number;
  limit?: number;
}

// Fetch users list
export function useUsers(filters: UserFilters = {}) {
  return useQuery<UserResponse>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const { data } = await api.get(`/users?${params.toString()}`);
      return data;
    },
  });
}

// update user's role
export function useUpdateRole() {
  const queryClinet = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data } = await api.patch(`/users/${id}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClinet.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// toggle user active/inactive

export function useToggleActive() {
  const queryClinet = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/users/${id}/toggle-active`);
      return data;
    },
    onSuccess: () => {
      queryClinet.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Fetch assignable users (agents + admins)

export function useAssignableUsers() {
  return useQuery<{ id: string; name: string; email: string; role: string }[]>({
    queryKey: ["users", "assignable"],
    queryFn: async () => {
      const { data } = await api.get("/users/assignable");
      return data;
    },
  });
}
