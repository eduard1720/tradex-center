import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { getLiveSessions, addLiveSession, deleteLiveSession } from "@/lib/live";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  return NextResponse.json({ sessions: await getLiveSessions() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Las clases en vivo requieren la base de datos (Supabase)." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const startsAtRaw = String(body.startsAt ?? "").trim();
  const link = String(body.link ?? "").trim();
  const date = new Date(startsAtRaw);

  if (title.length < 3) {
    return NextResponse.json({ error: "El título es obligatorio." }, { status: 422 });
  }
  if (!startsAtRaw || isNaN(date.getTime())) {
    return NextResponse.json({ error: "La fecha y hora son obligatorias." }, { status: 422 });
  }

  try {
    await addLiveSession({ title, startsAt: date.toISOString(), link });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Error al guardar la sesión en vivo:", err);
    return NextResponse.json({ error: "No se pudo guardar la sesión." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  }
  try {
    await deleteLiveSession(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar la sesión en vivo:", err);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
