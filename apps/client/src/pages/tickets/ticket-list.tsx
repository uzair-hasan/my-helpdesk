import { useState } from "react";
import { useTickets, useCreateTicket } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/page-header";
import { useNavigate } from "react-router-dom";

// Status & priority badge colors
const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Zod schema for create ticket form
const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export default function TicketListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  // TanStack Query - fetch tickets with filters
  const { data, isLoading, error } = useTickets({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  // TanStack Query - create ticket mutation
  const createTicket = useCreateTicket();

  // React Hook Form for the create dialog

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: "MEDIUM" },
  });

  // submit function
  const onCreateSubmit = async (formData: CreateTicketFormData) => {
    try {
      await createTicket.mutateAsync(formData);
      toast.success("Ticket Created!");
      setDialogOpen(false);
      reset();
    } catch {
      toast.error("Failed to  create ticket");
    }
  };
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Tickets"
          subtitle="Manage and track support tickets"
        />
        {/* Create Ticket Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            {/* form */}
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="spacey-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  className="my-2"
                  placeholder="Brief Summary of the issue"
                  {...register("title")}
                />
                {errors?.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail"
                  rows={4}
                  className="my-2"
                  {...register("description")}
                />
                {errors?.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  defaultValue="MEDIUM"
                  onValueChange={(value) =>
                    setValue(
                      "priority",
                      value as CreateTicketFormData["priority"],
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createTicket.isPending}
              >
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In_progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center">
          <p className="p-4 text-xs bg-destructive/10 rounded-md w-auto max-w-80 text-center  text-destructive">
            Failed to load tickets, please try again.
          </p>
        </div>
      )}

      {/* Tickets Table */}

      {data && (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No tickets found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.tickets.map((ticket) => (
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <TableCell className="font-normal">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={"secondary"}
                          className={statusColors[ticket.status]}
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={"secondary"}
                          className={priorityColors[ticket.priority]}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.createdBy.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.assignedTo?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data.pagination.total > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Showing {data.tickets.length} of {data.pagination.total} tickets
            </p>
          )}
        </>
      )}
    </div>
  );
}
