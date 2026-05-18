import { useAuth } from "@/context/auth-context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Ticket, Users, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tickets", href: "/tickets", icon: Ticket },
    { label: "Users", href: "/users", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <aside className="flex h-screen w-64 flex-col border-r bg-card">
          {/* app logo */}
          <div className="flex h-14 items-center px-6 font-semibold text-lg">
            <Ticket className="mr-2 h-5 w-5 text-primary" />
            Helpdesk
          </div>

          <Separator />

          {/* navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems?.map((navItem) => {
              const isActive =
                pathname === navItem.href ||
                pathname.startsWith(navItem.href + "/");
              return (
                <Tooltip key={navItem.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={navItem.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <navItem.icon className="h-4 w-4" />
                      {navItem.label}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{navItem.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <Separator />

          {/* user profile + logout */}
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role}
                </p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}
