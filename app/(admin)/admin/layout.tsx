import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-secondary-100">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
