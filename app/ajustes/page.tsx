import { User, Bell, Shield, Palette } from "lucide-react";

export const metadata = { title: "Ajustes — Hurtado Trader Academy" };

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-brand" : "bg-card-hover"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </span>
  );
}

export default function AjustesPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Tu cuenta</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Ajustes</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Profile */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-brand" />
            <h2 className="text-base font-semibold">Perfil</h2>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/20 text-xl font-bold text-brand">
              AH
            </span>
            <div>
              <button className="btn-ghost">Cambiar foto</button>
              <p className="mt-1.5 text-xs text-muted">JPG o PNG, máx. 2MB</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nombre</label>
              <input className="input" defaultValue="Angel Hurtado" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" defaultValue="angel@hurtadotrader.com" />
            </div>
            <div>
              <label className="label">Rol</label>
              <input className="input" defaultValue="Instructor" disabled />
            </div>
            <div>
              <label className="label">Idioma</label>
              <select className="input" defaultValue="es">
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <button className="btn-primary mt-5">Guardar cambios</button>
        </div>

        {/* Preferences */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-brand" />
              <h2 className="text-base font-semibold">Notificaciones</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["Nuevas clases", true],
                ["Sesiones en vivo", true],
                ["Respuestas en comunidad", false],
                ["Resumen semanal", true],
              ].map(([label, on]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-white/90">{label}</span>
                  <Toggle on={on as boolean} />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5 text-brand" />
              <h2 className="text-base font-semibold">Apariencia</h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/90">Tema oscuro</span>
              <Toggle on />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-brand" />
              <h2 className="text-base font-semibold">Seguridad</h2>
            </div>
            <button className="btn-ghost mt-4 w-full">Cambiar contraseña</button>
          </div>
        </div>
      </div>
    </div>
  );
}
