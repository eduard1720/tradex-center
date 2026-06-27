import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { getActiveStudentByCode } from "@/lib/students";
import { getCompletedClassIds, markCompleted, unmarkCompleted } from "@/lib/progressDb";

/** Resuelve el alumno a partir del header x-student-code (o null). */
async function resolveStudent(req: Request) {
  const code = req.headers.get("x-student-code")?.trim();
  if (!code || !hasSupabase()) return null;
  return getActiveStudentByCode(code);
}

export async function GET(req: Request) {
  const student = await resolveStudent(req);
  if (!student) return NextResponse.json({ completed: [] });
  return NextResponse.json({ completed: await getCompletedClassIds(student.id) });
}

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json({ error: "Requiere base de datos." }, { status: 503 });
  }
  const student = await resolveStudent(req);
  if (!student) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const classId = String(body.classId ?? "").trim();
  if (!classId) return NextResponse.json({ error: "Falta classId." }, { status: 422 });
  try {
    await markCompleted(student.id, classId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al marcar progreso:", err);
    return NextResponse.json({ error: "No se pudo guardar el progreso." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const student = await resolveStudent(req);
  if (!student) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  const classId = new URL(req.url).searchParams.get("classId")?.trim();
  if (!classId) return NextResponse.json({ error: "Falta classId." }, { status: 422 });
  try {
    await unmarkCompleted(student.id, classId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al borrar progreso:", err);
    return NextResponse.json({ error: "No se pudo actualizar el progreso." }, { status: 500 });
  }
}
