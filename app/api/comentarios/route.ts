import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import {
  listComments,
  addComment,
  setCommentApproved,
  deleteComment,
} from "@/lib/comments";
import { getActiveStudentByCode } from "@/lib/students";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  const admin = isAdmin(req);
  return NextResponse.json({ comments: await listComments(admin) });
}

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Los comentarios requieren la base de datos (Supabase)." },
      { status: 503 }
    );
  }
  const code = req.headers.get("x-student-code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "Inicia sesión para comentar." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const text = String(body.body ?? "").trim();
  if (text.length < 3) {
    return NextResponse.json({ error: "Escribe tu comentario." }, { status: 422 });
  }

  try {
    const student = await getActiveStudentByCode(code);
    if (!student) {
      return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
    }
    await addComment({ studentId: student.id, authorName: student.name, body: text });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Error al guardar comentario:", err);
    return NextResponse.json({ error: "No se pudo enviar el comentario." }, { status: 500 });
  }
}

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
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    await setCommentApproved(id, Boolean(body.approved));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al moderar comentario:", err);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    await deleteComment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar comentario:", err);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
