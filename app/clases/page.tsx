import Link from "next/link";
import { Upload } from "lucide-react";
import { ClassLibrary } from "@/components/ClassLibrary";
import { getAllClasses } from "@/lib/data";
import { CATEGORIES, type Category } from "@/lib/types";

export const metadata = { title: "Clases — Hurtado Trader Academy" };

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const classes = await getAllClasses();
  const initialCat = cat && CATEGORIES.includes(cat as Category) ? cat : "Todas";
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Biblioteca</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Todas las clases
          </h1>
        </div>
        <Link href="/subir" className="btn-primary">
          <Upload className="h-4 w-4" /> Subir clase
        </Link>
      </div>
      <ClassLibrary classes={classes} initialCat={initialCat} />
    </div>
  );
}
