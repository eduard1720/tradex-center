import { NextResponse } from "next/server";
import { hasSupabase, getSupabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/*  Subida de miniaturas (imágenes) para clases y módulos.                     */
/*  Guarda el archivo en el bucket público "thumbnails" y devuelve su URL.     */
/* -------------------------------------------------------------------------- */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";
const BUCKET = "thumbnails";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Subir miniaturas requiere la base de datos (Supabase)." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Formulario inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona una imagen." }, { status: 422 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen supera el límite de 8 MB." }, { status: 422 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safe}`;

  try {
    const sb = getSupabase();
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json(
        { error: `No se pudo subir la imagen: ${upErr.message}` },
        { status: 500 }
      );
    }
    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Error al subir la miniatura:", err);
    return NextResponse.json({ error: "No se pudo guardar la imagen." }, { status: 500 });
  }
}
