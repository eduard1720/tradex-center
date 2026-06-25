import { NextResponse } from "next/server";
import { addClass, getAllClasses } from "@/lib/data";
import { isValidVideoUrl } from "@/lib/video";
import { CATEGORIES, LEVELS, type Category, type Level } from "@/lib/types";

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
  const category = String(body.category ?? "") as Category;
  const level = String(body.level ?? "") as Level;
  const instructor = String(body.instructor ?? "Angel Hurtado").trim() || "Angel Hurtado";
  const durationMin = Math.max(1, Math.round(Number(body.durationMin) || 0));
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
  if (!CATEGORIES.includes(category)) errors.push("Categoría inválida.");
  if (!LEVELS.includes(level)) errors.push("Nivel inválido.");
  if (!durationMin) errors.push("Indica la duración en minutos.");

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
      durationMin,
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
