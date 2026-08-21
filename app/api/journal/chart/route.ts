import { NextResponse } from "next/server";
import { hasSupabase, getSupabase } from "@/lib/supabase";
import { getActiveStudentByCode } from "@/lib/students";

/* -------------------------------------------------------------------------- */
/*  Subida de la captura de gráfico para una entrada del journal (ej. el      */
/*  snapshot de TradingView tras Alt+S, pegado con Ctrl+V). Bucket público    */
/*  "journal-charts". Autenticado con el código del alumno.                   */
/* -------------------------------------------------------------------------- */

const BUCKET = "journal-charts";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Subir la captura requiere la base de datos (Supabase)." },
      { status: 503 }
    );
  }

  const code = req.headers.get("x-student-code")?.trim();
  const student = code ? await getActiveStudentByCode(code) : null;
  if (!student) {
    return NextResponse.json({ error: "Inicia sesión para subir la captura." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulario inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Pega o selecciona una imagen." }, { status: 422 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen supera el límite de 8 MB." }, { status: 422 });
  }

  const ext = file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "png";
  const path = `${student.id}/${Date.now()}.${ext}`;

  try {
    const sb = getSupabase();
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (upErr) {
      return NextResponse.json(
        { error: `No se pudo subir la imagen: ${upErr.message}` },
        { status: 500 }
      );
    }
    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Error al subir la captura del journal:", err);
    return NextResponse.json({ error: "No se pudo guardar la imagen." }, { status: 500 });
  }
}
