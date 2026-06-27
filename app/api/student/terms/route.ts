import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { acceptStudentTerms } from "@/lib/students";

export async function POST(req: Request) {
  const code = req.headers.get("x-student-code")?.trim();
  if (!code) {
    return NextResponse.json({ error: "Falta el código de alumno." }, { status: 401 });
  }

  if (!hasSupabase()) {
    return NextResponse.json({ error: "Requiere base de datos." }, { status: 503 });
  }

  try {
    await acceptStudentTerms(code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al aceptar términos:", err);
    return NextResponse.json({ error: "No se pudo registrar la aceptación." }, { status: 500 });
  }
}
