"use client";

import { File02, Globe02, Users01, Grid01, ArrowLeft } from "@untitledui/icons";
import { usePathname } from "next/navigation";

import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import type { NavItemType } from "@/components/application/app-navigation/config";

const adminNavItems: NavItemType[] = [
  { label: "Content Types", href: "/admin/content-types", icon: File02 },
  { label: "Origins", href: "/admin/origins", icon: Globe02 },
  { label: "Areas", href: "/admin/areas", icon: Grid01 },
  { label: "Users", href: "/admin/users", icon: Users01 },
];

const footerNavItems: NavItemType[] = [
  { label: "Voltar ao Dashboard", href: "/dashboard", icon: ArrowLeft },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-secondary bg-primary">
      <div className="flex h-16 items-center border-b border-secondary px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">Admin Panel</h2>
          <p className="text-xs text-tertiary">Configurações do sistema</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <NavList items={adminNavItems} activeUrl={pathname} />
      </nav>

      <div className="border-t border-secondary">
        <NavList items={footerNavItems} activeUrl="" className="mt-0 py-2" />
      </div>
    </aside>
  );
}
