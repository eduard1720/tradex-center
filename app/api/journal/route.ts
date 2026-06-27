import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { listEntries, addEntry, deleteEntry, type Direction, type Outcome } from "@/lib/journal";
import { getActiveStudentByCode } from "@/lib/students";

const DIRECTIONS: Direction[] = ["long", "short"];
const OUTCOMES: Outcome[] = ["win", "loss", "be"];

/** Resuelve el alumno a partir del header x-student-code (o null). */
async function resolveStudent(req: Request) {
  const code = req.headers.get("x-student-code")?.trim();
  if (!code || !hasSupabase()) return null;
  return getActiveStudentByCode(code);
}

export async function GET(req: Request) {
  const student = await resolveStudent(req);
  if (!student) return NextResponse.json({ entries: [] });
  return NextResponse.json({ entries: await listEntries(student.id) });
}

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "El journal requiere la base de datos (Supabase)." },
      { status: 503 }
    );
  }
  const student = await resolveStudent(req);
  if (!student) {
    return NextResponse.json({ error: "Inicia sesión para registrar operaciones." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const date = String(body.date ?? "").trim();
  const asset = String(body.asset ?? "").trim();
  if (!date) return NextResponse.json({ error: "Indica la fecha." }, { status: 422 });
  if (!asset) return NextResponse.json({ error: "Indica el activo o par." }, { status: 422 });

  const direction = DIRECTIONS.includes(body.direction as Direction)
    ? (body.direction as Direction)
    : "long";
  const outcome = OUTCOMES.includes(body.outcome as Outcome) ? (body.outcome as Outcome) : "be";

  try {
    await addEntry(student.id, {
      date,
      asset,
      direction,
      outcome,
      riskReward: String(body.riskReward ?? "").trim(),
      notes: String(body.notes ?? "").trim(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Error al guardar operación:", err);
    return NextResponse.json({ error: "No se pudo guardar la operación." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const student = await resolveStudent(req);
  if (!student) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    await deleteEntry(id, student.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar operación:", err);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
