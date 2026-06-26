import {
  Download,
  FileText,
  Presentation,
  BookOpen,
  Sheet,
  Image as ImageIcon,
  FileArchive,
  File,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getResources } from "@/lib/resources";
import { HerramientasUpload } from "@/components/HerramientasUpload";
import { ResourceDeleteButton } from "@/components/ResourceDeleteButton";

export const metadata = { title: "Herramientas — TradeX Center" };
export const dynamic = "force-dynamic";

const KIND: Record<string, { icon: LucideIcon; label: string }> = {
  pdf: { icon: FileText, label: "PDF" },
  slides: { icon: Presentation, label: "Diapositivas" },
  doc: { icon: FileText, label: "Documento" },
  book: { icon: BookOpen, label: "Libro" },
  sheet: { icon: Sheet, label: "Hoja de cálculo" },
  image: { icon: ImageIcon, label: "Imagen" },
  zip: { icon: FileArchive, label: "Comprimido" },
  file: { icon: File, label: "Archivo" },
};

export default async function HerramientasPage() {
  const resources = await getResources();

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
          PDFs, diapositivas, libros y todo el material que Angel comparte con la comunidad.
        </p>
      </div>

      {/* Subida (solo admin) */}
      <HerramientasUpload />

      {/* Lista de archivos */}
      {resources.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-muted">Aún no hay material publicado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const meta = KIND[r.kind] ?? KIND.file;
            const Icon = meta.icon;
            return (
              <div key={r.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ResourceDeleteButton id={r.id} />
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white">{r.title}</h3>
                <p className="mt-1 text-xs text-muted">{meta.label}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-4 justify-center"
                >
                  <Download className="h-4 w-4" /> Abrir / Descargar
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
