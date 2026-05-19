import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddComment, useTicket } from "@/hooks/use-tickets";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

export default function TicketDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading, error } = useTicket(id!);
  const addComment = useAddComment();
  const [comment, setComment] = useState("");

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addComment.mutateAsync({ ticketId: id!, content: comment });
      setComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive">Ticket not found</p>
        <Button variant={"outline"} onClick={() => navigate("/tickets")}>
          Back to tickets
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="max-w-4xl">
        {/* {back button + title } */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => navigate("/tickets")}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl ">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created By {ticket.createdBy.name} on{" "}
              {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={"secondary"} className={statusColors[ticket.status]}>
            {ticket.status.replace("_", " ")}
          </Badge>
          <Badge
            variant="secondary"
            className={priorityColors[ticket.priority]}
          >
            {ticket.priority}
          </Badge>
        </div>

        {/* ticket info */}
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">Description</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {ticket.description}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-sm">
            <div>
              <span className="text-muted-foreground">Assigned To:</span>
              <span className="ml-2">
                {ticket.assignedTo?.name ?? "Unassigned"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2">{ticket.category?.name ?? "None"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2">
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* comments section */}
        <div className="border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">
            Comments ({ticket.comments.length})
          </h2>

          {ticket.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">
              No comments yet. Be the first to comment.
            </p>
          ) : (
            <div className="space-y-4 mb-4">
              {ticket.comments.map((c) => (
                <div key={c.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* add comment form */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment.."
              rows={3}
              className="flex-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              onClick={handleAddComment}
              disabled={addComment.isPending || !comment.trim()}
              className="self-end"
              size={"icon"}
            >
              {addComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
