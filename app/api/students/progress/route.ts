import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { listStudents } from "@/lib/students";
import { getAllProgress } from "@/lib/progressDb";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

/**
 * Avance de cada alumno (solo Angel). Devuelve, por alumno, la lista de clases
 * completadas. El total y el % se calculan en el cliente con los módulos reales.
 */
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) return NextResponse.json({ students: [] });

  const [students, progress] = await Promise.all([listStudents(), getAllProgress()]);

  const byStudent = new Map<number, string[]>();
  for (const p of progress) {
    const list = byStudent.get(p.studentId) ?? [];
    list.push(p.classId);
    byStudent.set(p.studentId, list);
  }

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      active: s.active,
      completed: byStudent.get(s.id) ?? [],
    })),
  });
}
