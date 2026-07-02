import { Wrench } from "lucide-react";
import { getResources } from "@/lib/resources";
import { getAllClasses } from "@/lib/data";
import { HerramientasView, type ToolItem } from "@/components/HerramientasView";

export const metadata = { title: "Herramientas — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function HerramientasPage() {
  const [resources, classes] = await Promise.all([getResources(), getAllClasses()]);

  // Metadatos de cada clase para poder ordenar el material por módulo y lección.
  const byId = new Map(classes.map((c) => [c.id, c]));

  const items: ToolItem[] = resources
    .map((r) => {
      const cls = r.classId ? byId.get(r.classId) : undefined;
      return {
        item: {
          id: r.id,
          title: r.title,
          kind: r.kind,
          url: r.url,
          target: r.target,
          classId: r.classId,
          className: cls?.title ?? "",
        } as ToolItem,
        // Orden: primero por módulo, luego por posición de la lección.
        module: cls?.module ?? 999,
        order: cls?.order ?? 999,
        createdAt: r.createdAt,
      };
    })
    .sort(
      (a, b) =>
        a.module - b.module ||
        a.order - b.order ||
        a.createdAt.localeCompare(b.createdAt)
    )
    .map((x) => x.item);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <Wrench className="h-4 w-4" /> Material de apoyo
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Herramientas
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          PDFs, diapositivas, libros y todo el material de tus clases, ordenado por módulo y lección.
        </p>
      </div>

      <HerramientasView items={items} />
    </div>
  );
}
