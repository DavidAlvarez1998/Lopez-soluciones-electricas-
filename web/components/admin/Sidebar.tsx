"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: "📋" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: "📄" },
  { href: "/admin/cuentas-cobro", label: "Cuentas de Cobro", icon: "💰" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 min-h-screen bg-navy-2 flex flex-col border-r border-white/5
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
          md:relative md:translate-x-0 md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display text-xl font-bold text-off-white">LÓPEZ</h2>
          <p className="text-blue-glow text-xs tracking-widest uppercase mt-0.5">
            ⚡ Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue/20 text-off-white border border-blue/30"
                    : "text-brand-gray hover:bg-white/5 hover:text-off-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-brand-gray text-xs text-center">
            López Soluciones Eléctricas
          </p>
        </div>
      </aside>
    </>
  );
}
