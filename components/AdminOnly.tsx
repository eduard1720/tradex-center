"use client";

import { useAdmin } from "@/lib/admin";

/** Renderiza su contenido solo cuando hay sesión de administrador (Angel). */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAdmin = useAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
}
