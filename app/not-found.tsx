import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-bold text-brand">404</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Página no encontrada</h1>
        <p className="mt-1 text-sm text-muted">
          La clase o sección que buscas no existe o fue movida.
        </p>
        <Link href="/" className="btn-primary mt-6">
          <Home className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
