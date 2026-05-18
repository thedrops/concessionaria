"use client";

import { ReactNode, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

interface AdminLayoutWrapperProps {
  children: ReactNode;
  user: any;
}

export default function AdminLayoutWrapper({
  children,
  user,
}: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header with hamburger */}
        <header className="lg:hidden flex items-center gap-3 bg-primary-500 px-4 py-3 text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-primary-600 transition"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-lg">Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
