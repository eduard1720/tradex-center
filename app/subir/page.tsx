import { UploadForm } from "@/components/UploadForm";
import { getAllClasses } from "@/lib/data";

export const metadata = { title: "Subir clase — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function SubirPage() {
  const classes = await getAllClasses();

  // Módulos existentes (derivados de las clases), para poder añadirles clases.
  const map = new Map<number, { title: string; thumbnail: string }>();
  for (const c of classes) {
    if (c.module <= 0) continue;
    const cur = map.get(c.module);
    if (!cur) {
      map.set(c.module, {
        title: c.moduleTitle || `Módulo ${c.module}`,
        thumbnail: c.moduleThumbnail || c.thumbnail || "",
      });
    } else if (!cur.thumbnail && (c.moduleThumbnail || c.thumbnail)) {
      cur.thumbnail = c.moduleThumbnail || c.thumbnail;
    }
  }
  const modules = [...map.entries()]
    .map(([module, v]) => ({ module, title: v.title, thumbnail: v.thumbnail }))
    .sort((a, b) => a.module - b.module);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Subir nueva clase
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Primero crea (o elige) el módulo al que pertenece la clase. Luego sube tu video a
          YouTube o Vimeo y pega el link: la miniatura y el reproductor se generan solos.
        </p>
      </div>
      <UploadForm modules={modules} />
    </div>
  );
}
