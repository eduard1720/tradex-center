import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { getSetting, setSetting } from "@/lib/settings";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

/** Claves que se pueden leer/escribir desde estos endpoints. */
const ALLOWED = new Set(["welcome_video", "terms_text"]);

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!ALLOWED.has(key)) {
    return NextResponse.json({ error: "Clave no permitida." }, { status: 400 });
  }
  return NextResponse.json({ value: await getSetting(key) });
}

export async function POST(req: Request) {
  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Guardar ajustes requiere la base de datos (Supabase)." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const key = String(body.key ?? "");
  if (!ALLOWED.has(key)) {
    return NextResponse.json({ error: "Clave no permitida." }, { status: 400 });
  }
  try {
    await setSetting(key, String(body.value ?? ""));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al guardar ajuste:", err);
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}
