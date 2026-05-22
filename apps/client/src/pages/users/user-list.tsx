import { useState } from "react";
import { useUsers, useUpdateRole, useToggleActive } from "@/hooks/use-users";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/page-header";
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
import { Loader2, ShieldCheck, ShieldAlert, User, Loader } from "lucide-react";
import { toast } from "sonner";

const roleColors: Record<string, string> = {
  USER: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  AGENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ADMIN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const roleIcons: Record<string, React.ReactNode> = {
  USER: <User className="h-3.5 w-3.5" />,
  AGENT: <ShieldCheck className="h-3.5 w-3.5" />,
  ADMIN: <ShieldAlert className="h-3.5 w-3.5" />,
};

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUsers({
    role: roleFilter || undefined,
    page,
  });

  const updateRole = useUpdateRole();
  const toggleActive = useToggleActive();

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateRole.mutateAsync({ id: userId, role });
      toast.success("Role Updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await toggleActive.mutateAsync(userId);
      toast.success(isActive ? "User deactivated" : "User activated");
    } catch {
      toast.error("Failed to update user status");
    }
  };
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Users" subtitle="Manage user accounts and role" />
      </div>

      {/* role filter */}
      <div className="flex gap-3 mb-4">
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex justify-center items-center">
          <p className="p-4 text-xs bg-destructive/10 rounded-md w-auto max-w-80 text-center text-destructive">
            Failed to load users. You may not have admin permissions.
          </p>
        </div>
      )}

      {/* user's table */}
      {data && (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>

                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(role) =>
                            handleRoleChange(user.id, role)
                          }
                          disabled={user.id === currentUser?.id}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={"secondary"}
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user.id === currentUser?.id}
                          onClick={() =>
                            handleToggleActive(user.id, user.isActive)
                          }
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          {data.pagination.totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {data.users.length} of {data.pagination.total} users
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant={"outline"}
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
