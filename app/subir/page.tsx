import { UploadForm } from "@/components/UploadForm";

export const metadata = { title: "Subir clase — TradeX Center" };

export default function SubirPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Panel del instructor</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Subir nueva clase
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Sube tu video a YouTube o Vimeo (puedes ponerlo como “oculto / no listado”),
          luego pega aquí el link. La miniatura y el reproductor se generan automáticamente.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
