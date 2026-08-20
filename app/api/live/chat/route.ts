import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { listChatMessages, addChatMessage } from "@/lib/live-chat";
import { getActiveStudentByCode } from "@/lib/students";
import { getLiveSessions } from "@/lib/live";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

type Identity = { name: string; isAdmin: boolean; studentId: number | null };

async function getIdentity(req: Request): Promise<Identity | null> {
  if (req.headers.get("x-admin-password") === ADMIN_PASSWORD) {
    return { name: "Angel", isAdmin: true, studentId: null };
  }
  const code = req.headers.get("x-student-code");
  if (!code) return null;
  const student = await getActiveStudentByCode(code);
  if (!student) return null;
  return { name: student.name, isAdmin: false, studentId: student.id };
}

/** ¿La sesión pedida sigue en vivo ahora mismo? Evita chatear en clases viejas. */
async function isSessionLive(sessionId: number): Promise<boolean> {
  const sessions = await getLiveSessions();
  return sessions.some((s) => s.id === sessionId && s.isLive);
}

export async function GET(req: Request) {
  if (!hasSupabase()) return NextResponse.json({ messages: [] });

  const identity = await getIdentity(req);
  if (!identity) return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });

  const url = new URL(req.url);
  const sessionId = Number(url.searchParams.get("sessionId"));
  const afterId = Number(url.searchParams.get("afterId") ?? 0);
  if (!sessionId) return NextResponse.json({ error: "sessionId inválido." }, { status: 400 });

  const messages = await listChatMessages(sessionId, afterId);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json({ error: "El chat requiere la base de datos (Supabase)." }, { status: 503 });
  }

  const identity = await getIdentity(req);
  if (!identity) return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const sessionId = Number(body.sessionId);
  const text = String(body.body ?? "").trim();
  if (!sessionId) return NextResponse.json({ error: "sessionId inválido." }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Escribe un mensaje." }, { status: 422 });
  if (!(await isSessionLive(sessionId))) {
    return NextResponse.json({ error: "Esta clase ya no está en vivo." }, { status: 409 });
  }

  try {
    const message = await addChatMessage({
      sessionId,
      studentId: identity.studentId,
      authorName: identity.name,
      isAdmin: identity.isAdmin,
      body: text,
    });
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("Error al enviar mensaje del chat en vivo:", err);
    return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
