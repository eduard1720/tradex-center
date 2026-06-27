import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import {
  listStudents,
  addStudent,
  setStudentActive,
  deleteStudent,
} from "@/lib/students";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

function needsDb() {
  return NextResponse.json(
    { error: "La gestión de alumnos requiere la base de datos (Supabase)." },
    { status: 503 }
  );
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) return NextResponse.json({ students: [] });
  return NextResponse.json({ students: await listStudents() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) return needsDb();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Escribe el nombre del alumno." }, { status: 422 });
  }
  try {
    const student = await addStudent(name);
    return NextResponse.json({ student }, { status: 201 });
  } catch (err) {
    console.error("Error al crear alumno:", err);
    return NextResponse.json({ error: "No se pudo crear el alumno." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) return needsDb();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    await setStudentActive(id, Boolean(body.active));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al actualizar alumno:", err);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) return needsDb();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    await deleteStudent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar alumno:", err);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
