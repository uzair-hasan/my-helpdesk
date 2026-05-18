import { Outlet } from "react-router-dom";
import { ThemeToggle } from "../theme-toggle";
import { Sidebar } from "./sidebar";

export function DashboardLayout() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-end border-b px-6">
            <ThemeToggle />
          </header>

          {/* main content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
