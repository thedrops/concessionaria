import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";

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
    <AdminLayoutWrapper user={session.user}>{children}</AdminLayoutWrapper>
  );
}
