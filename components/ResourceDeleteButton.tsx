"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";

export function ResourceDeleteButton({ id }: { id: number }) {
  const isAdmin = useAdmin();
  const router = useRouter();
  if (!isAdmin) return null;

  async function remove() {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/herramientas?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      title="Eliminar"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
