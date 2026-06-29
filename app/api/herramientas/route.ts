import { NextResponse } from "next/server";
import { hasSupabase, getSupabase } from "@/lib/supabase";
import {
  BUCKET,
  getResources,
  addResource,
  deleteResource,
  kindFromName,
} from "@/lib/resources";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  return NextResponse.json({ resources: await getResources() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Las herramientas requieren la base de datos (Supabase)." },
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
  const title = String(form.get("title") ?? "").trim();
  const target = String(form.get("target") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona un archivo." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El archivo supera el límite de 50 MB." }, { status: 422 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safe}`;
  const kind = kindFromName(file.name);

  try {
    const sb = getSupabase();
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json(
        { error: `No se pudo subir el archivo: ${upErr.message}` },
        { status: 500 }
      );
    }
    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    await addResource({ title: title || file.name, fileName: file.name, url, path, kind, target });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Error al subir la herramienta:", err);
    return NextResponse.json({ error: "No se pudo guardar la herramienta." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  try {
    await deleteResource(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar la herramienta:", err);
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
