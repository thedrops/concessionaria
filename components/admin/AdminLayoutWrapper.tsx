"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutWrapperProps {
  children: ReactNode;
  user: any;
}

export default function AdminLayoutWrapper({
  children,
  user,
}: AdminLayoutWrapperProps) {
  return (
    <div className="flex h-screen bg-secondary-100">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
