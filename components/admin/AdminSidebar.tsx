"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user: any;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/carros", label: "Carros", icon: Car },
    { href: "/admin/carrossel", label: "Carrossel", icon: ImageIcon },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-primary-500 text-white flex flex-col">
      <div className="p-6 border-b border-primary-600">
        <Link href="/admin" className="flex items-center space-x-2">
          <Car className="h-8 w-8" />
          <span className="font-bold text-xl">Admin</span>
        </Link>
        <div className="mt-4 text-sm">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-primary-200 text-xs">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-6 py-3 transition ${
                isActive
                  ? "bg-primary-600 border-l-4 border-accent-500"
                  : "hover:bg-primary-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-primary-600">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center space-x-3 text-primary-100 hover:text-white transition w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
