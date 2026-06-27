import { NextResponse } from "next/server";
import {
  addClass,
  getAllClasses,
  updateClass,
  deleteClass,
  type ClassPatch,
} from "@/lib/data";
import { isValidVideoUrl } from "@/lib/video";
import { LEVELS, type Level } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ classes: await getAllClasses() });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

export async function POST(req: Request) {
  // Solo Angel (administrador) puede subir clases.
  if (req.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Acceso denegado. Clave de administrador incorrecta." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const videoUrl = String(body.videoUrl ?? "").trim();
  const category = String(body.category ?? "").trim();
  const level = String(body.level ?? "") as Level;
  const instructor = String(body.instructor ?? "Angel Hurtado").trim() || "Angel Hurtado";
  const moduleNum = Math.max(0, Math.round(Number(body.module) || 0));
  const moduleTitle = String(body.moduleTitle ?? "").trim();
  const tags = Array.isArray(body.tags)
    ? (body.tags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
    : String(body.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  // Validation
  const errors: string[] = [];
  if (title.length < 4) errors.push("El título es obligatorio (mín. 4 caracteres).");
  if (description.length < 10) errors.push("Añade una descripción (mín. 10 caracteres).");
  if (!isValidVideoUrl(videoUrl)) errors.push("El link debe ser de YouTube o Vimeo.");
  if (!category) errors.push("Escribe una categoría para la clase.");
  if (!LEVELS.includes(level)) errors.push("Nivel inválido.");

  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 422 });
  }

  try {
    const created = await addClass({
      title,
      description,
      videoUrl,
      category,
      level,
      instructor,
      tags,
      module: moduleNum,
      moduleTitle,
    });
    return NextResponse.json({ class: created }, { status: 201 });
  } catch (err) {
    console.error("Error al guardar la clase:", err);
    return NextResponse.json(
      { error: "No se pudo guardar la clase. Revisa la conexión con la base de datos." },
      { status: 500 }
    );
  }
}

function isAdmin(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const patch: ClassPatch = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.videoUrl === "string" && body.videoUrl.trim()) {
    if (!isValidVideoUrl(body.videoUrl)) {
      return NextResponse.json({ error: "El link debe ser de YouTube o Vimeo." }, { status: 422 });
    }
    patch.videoUrl = body.videoUrl.trim();
  }
  if (typeof body.category === "string") {
    const cat = body.category.trim();
    if (!cat) {
      return NextResponse.json({ error: "La categoría no puede quedar vacía." }, { status: 422 });
    }
    patch.category = cat;
  }
  if (typeof body.level === "string") {
    if (!LEVELS.includes(body.level as Level)) {
      return NextResponse.json({ error: "Nivel inválido." }, { status: 422 });
    }
    patch.level = body.level as Level;
  }
  if (body.module !== undefined) patch.module = Math.max(0, Math.round(Number(body.module) || 0));
  if (typeof body.moduleTitle === "string") patch.moduleTitle = body.moduleTitle.trim();
  if (body.tags !== undefined) {
    patch.tags = Array.isArray(body.tags)
      ? (body.tags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : String(body.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
  }

  try {
    await updateClass(id, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al actualizar la clase:", err);
    return NextResponse.json({ error: "No se pudo actualizar la clase." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  try {
    await deleteClass(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar la clase:", err);
    return NextResponse.json({ error: "No se pudo eliminar la clase." }, { status: 500 });
  }
}
