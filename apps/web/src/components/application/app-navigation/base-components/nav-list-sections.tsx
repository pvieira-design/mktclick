"use client";

import { cx } from "@/lib/utils/cx";
import type { NavItemType } from "../config";
import { NavItemBase } from "./nav-item";

export interface NavSection {
  label: string;
  items: NavItemType[];
}

interface NavListSectionsProps {
  activeUrl?: string;
  className?: string;
  sections: NavSection[];
}

export const NavListSections = ({
  activeUrl,
  sections,
  className,
}: NavListSectionsProps) => {
  return (
    <nav className={cx("flex flex-col gap-6 px-2 py-4 lg:px-4", className)}>
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-quaternary">
            {section.label}
          </h3>
          <ul className="flex flex-col">
            {section.items.map((item) => (
              <li key={item.label} className="py-0.5">
                <NavItemBase
                  type="link"
                  badge={item.badge}
                  icon={item.icon}
                  href={item.href}
                  current={activeUrl === item.href}
                >
                  {item.label}
                </NavItemBase>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};
