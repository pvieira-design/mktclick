"use client";

import {
  ClipboardCheck,
  File02,
  FolderClosed,
  Globe02,
  Grid01,
  Tag01,
  Users01,
} from "@untitledui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  NavListSections,
  type NavSection,
} from "@/components/application/app-navigation/base-components/nav-list-sections";
import { ClickLogo } from "@/components/foundations/logo/click-logo";

interface SidebarProps {
  children?: ReactNode;
  userRole?: string;
}

export function Sidebar({ children, userRole }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  const getActiveUrl = () => {
    if (pathname.startsWith("/admin/content-types")) return "/admin/content-types";
    if (pathname.startsWith("/admin/origins")) return "/admin/origins";
    if (pathname.startsWith("/admin/areas")) return "/admin/areas";
    if (pathname.startsWith("/admin/users")) return "/admin/users";
    if (pathname.startsWith("/admin/tags")) return "/admin/tags";
    if (pathname.startsWith("/criadores")) return "/criadores";
    if (pathname.startsWith("/library")) return "/library";
    return "/dashboard";
  };

  const activeUrl = getActiveUrl();

  const sections: NavSection[] = [
    {
      label: "General",
      items: [
        { label: "Requests", href: "/dashboard", icon: ClipboardCheck },
        { label: "Criadores", href: "/criadores", icon: Users01 },
        { label: "Biblioteca", href: "/library", icon: FolderClosed },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      label: "Admin",
      items: [
        { label: "Content Types", href: "/admin/content-types", icon: File02 },
        { label: "Origins", href: "/admin/origins", icon: Globe02 },
        { label: "Areas", href: "/admin/areas", icon: Grid01 },
        { label: "Users", href: "/admin/users", icon: Users01 },
        { label: "Tags", href: "/admin/tags", icon: Tag01 },
      ],
    });
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-secondary bg-primary">
      <div className="flex h-16 items-center border-b border-secondary px-4 lg:px-6">
        <Link href="/dashboard">
          <ClickLogo />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavListSections sections={sections} activeUrl={activeUrl} />
      </div>

      {children && (
        <div className="border-t border-secondary">{children}</div>
      )}
    </aside>
  );
}
