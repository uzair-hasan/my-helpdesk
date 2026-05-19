import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

// Types matching what the backend returns

interface User {
  id: string;
  name: string;
  email: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdBy: User;
  assignedTo: User | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TicketFilters {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  user: User;
}

interface TicketDetail extends Ticket {
  comments: Comment[];
}

// Hook to fetch tickets list
export function useTickets(filters: TicketFilters = {}) {
  return useQuery<TicketResponse>({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const { data } = await api.get(`/tickets?${params.toString()}`);
      return data;
    },
  });
}

// Hook to create a ticket

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      priority?: string;
    }) => {
      const { data } = await api.post("/tickets", input);
      return data;
    },
    onSuccess: () => {
      // Invalidated the tickets cache so the list refatches
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

// Hookto update a ticket

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      status?: string;
      priority?: string;
      assignedToId: string;
    }) => {
      const { data } = await api.patch(`/tickets/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

// hook to fetch a single ticket by ID
export function useTicket(id: string) {
  return useQuery<TicketDetail>({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${id}`);
      return data;
    },
  });
}

// hook to add comment to a ticket
export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
    }: {
      ticketId: string;
      content: string;
    }) => {
      const { data } = await api.post(`/tickets/${ticketId}/comments`, {
        content,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      // Refetch this specific ticket so the new comment appears
      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });
    },
  });
}
