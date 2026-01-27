"use client";

import { ClipboardList, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navigation = [
  { name: "Requests", href: "/dashboard", icon: ClipboardList },
] as const;

interface SidebarProps {
  children?: ReactNode;
  userRole?: string;
}

export function Sidebar({ children, userRole }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "SUPER_ADMIN";

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-semibold">MKT Click</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-muted"
                )}
              >
                <item.icon className="size-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}

        {isAdmin && (
          <Link href="/admin">
            <Button
              variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                pathname.startsWith("/admin") && "bg-muted"
              )}
            >
              <Settings className="size-4" />
              Admin Panel
            </Button>
          </Link>
        )}
      </nav>

      {children}
    </aside>
  );
}
