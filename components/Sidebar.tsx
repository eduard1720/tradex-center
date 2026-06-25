"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HelpCircle, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import { Logo } from "./Logo";
import { SidebarVigencia } from "./SidebarVigencia";
import { AdminControl } from "./AdminControl";
import { useAdmin } from "@/lib/admin";
import { MAIN_NAV, ADMIN_NAV, type NavItem } from "@/lib/nav";

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-brand-soft text-white"
          : "text-muted hover:bg-card-hover hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-brand" style={{ width: 3 }} />
      )}
      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand" : ""}`} />
      {!collapsed && <span className="truncate font-medium">{item.label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = useAdmin();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-bg-soft/80 px-3 py-5 backdrop-blur md:flex ${
        collapsed ? "w-[76px]" : "w-[244px]"
      } transition-[width] duration-200`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-1`}>
        <Logo compact={collapsed} />
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mt-5 mb-3 flex items-center gap-2 self-end rounded-lg border border-line p-1.5 text-muted hover:text-white"
        aria-label="Colapsar menú"
      >
        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
            Menú
          </p>
        )}
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
        ))}

        {/* Sección de instructor: solo visible para Angel (modo admin) */}
        {isAdmin && (
          <>
            <div className="my-3 h-px bg-line" />
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                Instructor
              </p>
            )}
            {ADMIN_NAV.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Apartado de suscripción/vigencia (encima de Ayuda) */}
      <div className="mt-2">
        <SidebarVigencia collapsed={collapsed} />
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-line pt-3">
        <AdminControl collapsed={collapsed} />
        <NavLink
          item={{ label: "Ayuda", href: "/ayuda", icon: HelpCircle }}
          active={isActive("/ayuda")}
          collapsed={collapsed}
        />
        <NavLink
          item={{ label: "Ajustes", href: "/ajustes", icon: Settings }}
          active={isActive("/ajustes")}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
