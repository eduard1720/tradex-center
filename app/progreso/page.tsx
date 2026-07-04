import { getAllClasses } from "@/lib/data";
import type { ProgressModule } from "@/components/ProgressView";
import { ProgresoSwitch } from "@/components/ProgresoSwitch";

export const metadata = { title: "Mi progreso — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function ProgresoPage() {
  const classes = await getAllClasses();

  // Agrupa las clases por módulo (igual que la vista de clases), en orden.
  const map = new Map<number, ProgressModule>();
  for (const c of classes) {
    if (c.module <= 0) continue; // las clases en vivo no entran en módulos
    if (!map.has(c.module)) {
      map.set(c.module, {
        module: c.module,
        title: c.moduleTitle || "",
        lessons: [],
      });
    }
    map.get(c.module)!.lessons.push({ id: c.id, title: c.title });
  }
  const modules = [...map.values()].sort((a, b) => a.module - b.module);
  for (const m of modules) {
    // Ordena las clases por su posición; aquí ya vienen ordenadas por created_at,
    // pero reforzamos por id estable.
    m.lessons.sort((a, b) => a.id.localeCompare(b.id));
  }

  return <ProgresoSwitch modules={modules} />;
}
