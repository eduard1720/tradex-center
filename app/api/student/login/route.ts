import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { getActiveStudentByCode } from "@/lib/students";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code) {
    return NextResponse.json({ error: "Ingresa tu código de acceso." }, { status: 422 });
  }

  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "El acceso requiere la base de datos. Contacta a Angel." },
      { status: 503 }
    );
  }

  try {
    const student = await getActiveStudentByCode(code);
    if (!student) {
      return NextResponse.json(
        { error: "Código incorrecto o cuenta desactivada. Contacta a Angel." },
        { status: 401 }
      );
    }
    return NextResponse.json({
      name: student.name,
      termsAccepted: Boolean(student.termsAcceptedAt),
    });
  } catch (err) {
    console.error("Error al validar el código de alumno:", err);
    return NextResponse.json({ error: "No se pudo validar el acceso." }, { status: 500 });
  }
}
