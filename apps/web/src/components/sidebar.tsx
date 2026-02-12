"use client";

import {
  BarChartSquare02,
  ClipboardCheck,
  File02,
  Film01,
  FolderClosed,
  Globe02,
  Grid01,
  Settings01,
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
  const isCreatorOnly = userRole === "CREATOR_ONLY";

  const getActiveUrl = () => {
    if (pathname.startsWith("/ads-requests")) return "/ads-requests";
    if (pathname.startsWith("/admin/ads-types")) return "/admin/ads-types";
    if (pathname.startsWith("/admin/content-types")) return "/admin/content-types";
    if (pathname.startsWith("/admin/origins")) return "/admin/origins";
    if (pathname.startsWith("/admin/areas")) return "/admin/areas";
    if (pathname.startsWith("/admin/users")) return "/admin/users";
    if (pathname.startsWith("/admin/tags")) return "/admin/tags";
    if (pathname.startsWith("/criadores")) return "/criadores";
    if (pathname.startsWith("/library")) return "/library";
    if (pathname.startsWith("/ads")) return "/ads";
    return "/dashboard";
  };

  const activeUrl = getActiveUrl();

  const sections: NavSection[] = isCreatorOnly
    ? [
        {
          label: "General",
          items: [
            { label: "Criadores", href: "/criadores", icon: Users01 },
          ],
        },
      ]
    : [
        {
          label: "General",
          items: [
            { label: "Requests", href: "/dashboard", icon: ClipboardCheck },
            { label: "Ads Request", href: "/ads-requests", icon: Film01 },
            { label: "Criadores", href: "/criadores", icon: Users01 },
            { label: "Biblioteca", href: "/library", icon: FolderClosed },
            { label: "Anúncios", href: "/ads", icon: BarChartSquare02 },
          ],
        },
      ];

  if (isAdmin) {
    sections.push({
      label: "Admin",
       items: [
         { label: "Content Types", href: "/admin/content-types", icon: File02 },
         { label: "Ads Types", href: "/admin/ads-types", icon: Settings01 },
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
        <Link href={isCreatorOnly ? "/criadores" : "/dashboard"}>
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
