import { NextResponse } from "next/server";
import { renameModule, deleteModule, setModuleThumbnail } from "@/lib/data";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

/** Renombra un módulo (cambia el título a todas sus clases). */
export async function PATCH(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const module = Math.round(Number(body.module));
  if (!module) {
    return NextResponse.json({ error: "Falta el módulo." }, { status: 422 });
  }

  // Cambio de miniatura del módulo (puede venir vacío para volver a la automática).
  if (typeof body.thumbnail === "string") {
    try {
      await setModuleThumbnail(module, body.thumbnail.trim());
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("Error al actualizar la miniatura del módulo:", err);
      return NextResponse.json({ error: "No se pudo actualizar la miniatura." }, { status: 500 });
    }
  }

  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "El título es obligatorio." }, { status: 422 });
  }
  try {
    await renameModule(module, title);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al renombrar el módulo:", err);
    return NextResponse.json({ error: "No se pudo renombrar el módulo." }, { status: 500 });
  }
}

/** Elimina un módulo completo (todas sus clases). */
export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const module = Math.round(Number(new URL(req.url).searchParams.get("module")));
  if (!module) {
    return NextResponse.json({ error: "Falta el módulo." }, { status: 400 });
  }
  try {
    await deleteModule(module);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar el módulo:", err);
    return NextResponse.json({ error: "No se pudo eliminar el módulo." }, { status: 500 });
  }
}
