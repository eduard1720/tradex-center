import Link from "next/link";
import { Upload, Radio } from "lucide-react";
import { ModulesView } from "@/components/ModulesView";
import { getAllClasses } from "@/lib/data";

export const metadata = { title: "Clases — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function ClasesPage() {
  const classes = await getAllClasses();
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Ruta de aprendizaje</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Clases por módulos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Avanza módulo por módulo. Cada clase se desbloquea al completar la anterior.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/en-vivo" className="btn-ghost">
            <Radio className="h-4 w-4" /> Clases en vivo
          </Link>
          <Link href="/subir" className="btn-primary">
            <Upload className="h-4 w-4" /> Subir clase
          </Link>
        </div>
      </div>
      <ModulesView classes={classes} />
    </div>
  );
}
