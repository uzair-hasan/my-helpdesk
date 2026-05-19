// Map route segment to display labels

import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const segmentLabel: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  users: "Users",
  settings: "Settings",
};

export function BreadCrumb() {
  const location = useLocation();

  //split path into segments,filter out empty strings
  const segments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on single-level routes like /dashboard
  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {segments.map((segment, index) => {
        // Build the path up to this segment
        const path = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        // Use the label map, or fall back to "Detail" for UUIDs
        const label =
          segmentLabel[segment] || (segment.includes("-") ? "Detail" : segment);

        return (
          <span key={path} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
