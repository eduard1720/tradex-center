import { Users } from "lucide-react";
import { StudentsAdmin } from "@/components/StudentsAdmin";

export const metadata = { title: "Alumnos — TradeX Center" };

export default function AlumnosPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <Users className="h-4 w-4" /> Gestión de acceso
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Alumnos
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Da de alta a tus alumnos, comparte su código de acceso y activa o desactiva su entrada
          cuando lo necesites.
        </p>
      </div>

      <StudentsAdmin />
    </div>
  );
}
