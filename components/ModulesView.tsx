"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import type { TradingClass } from "@/lib/types";
import { getCompleted, onProgressChange } from "@/lib/progress";
import { useAdmin, getAdminPw } from "@/lib/admin";
import { ClassEditModal } from "@/components/ClassEditModal";

interface ModuleGroup {
  module: number;
  title: string;
  lessons: TradingClass[];
}

function buildModules(classes: TradingClass[]): ModuleGroup[] {
  const map = new Map<number, ModuleGroup>();
  for (const c of classes) {
    if (c.module <= 0) continue; // las clases en vivo no entran en módulos
    if (!map.has(c.module)) {
      map.set(c.module, { module: c.module, title: c.moduleTitle || `Módulo ${c.module}`, lessons: [] });
    }
    map.get(c.module)!.lessons.push(c);
  }
  const groups = [...map.values()].sort((a, b) => a.module - b.module);
  for (const g of groups) g.lessons.sort((a, b) => a.order - b.order);
  return groups;
}

export function ModulesView({ classes }: { classes: TradingClass[] }) {
  const modules = useMemo(() => buildModules(classes), [classes]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const isAdmin = useAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState<TradingClass | null>(null);

  useEffect(() => {
    const sync = () => setCompleted(getCompleted());
    sync();
    setReady(true);
    return onProgressChange(sync);
  }, []);

  const moduleDone = (g: ModuleGroup) => g.lessons.every((l) => completed.has(l.id));

  async function deleteLesson(id: string) {
    if (!window.confirm("¿Eliminar esta clase? No se puede deshacer.")) return;
    await fetch(`/api/clases?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  async function renameModuleHandler(module: number, current: string) {
    const title = window.prompt("Nuevo nombre del módulo:", current);
    if (!title || !title.trim()) return;
    await fetch("/api/modulos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
      body: JSON.stringify({ module, title: title.trim() }),
    });
    router.refresh();
  }

  async function deleteModuleHandler(module: number) {
    if (!window.confirm(`¿Eliminar el Módulo ${module} y TODAS sus clases? No se puede deshacer.`)) return;
    await fetch(`/api/modulos?module=${module}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  if (modules.length === 0) {
    return (
      <div className="card grid place-items-center py-16 text-center">
        <p className="text-muted">Aún no hay clases en módulos. Angel las publicará pronto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {modules.map((g, mi) => {
        // Un módulo se desbloquea cuando el anterior está completo.
        // En modo admin todo está desbloqueado para poder gestionarlo.
        const moduleUnlocked = isAdmin || mi === 0 || moduleDone(modules[mi - 1]);
        const doneCount = g.lessons.filter((l) => completed.has(l.id)).length;
        const pct = Math.round((doneCount / g.lessons.length) * 100);

        return (
          <div
            key={g.module}
            className={`card overflow-hidden p-0 ${!moduleUnlocked ? "opacity-90" : ""}`}
          >
            {/* Cabecera del módulo */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-bold ${
                    moduleUnlocked ? "bg-brand text-black" : "bg-card-soft text-muted"
                  }`}
                >
                  {moduleUnlocked ? g.module : <Lock className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Módulo {g.module}</p>
                  <h3 className="text-base font-semibold text-white">{g.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => renameModuleHandler(g.module, g.title)}
                      title="Renombrar módulo"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteModuleHandler(g.module)}
                      title="Eliminar módulo"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {doneCount}/{g.lessons.length} clases
                  </p>
                  <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-card-soft">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de bloqueo */}
            {!moduleUnlocked && (
              <div className="flex items-center gap-2 bg-card-soft/40 px-5 py-2.5 text-xs text-muted">
                <Lock className="h-3.5 w-3.5" />
                Completa el <strong className="text-white/80">Módulo {modules[mi - 1].module}</strong> para desbloquear este módulo.
              </div>
            )}

            {/* Clases del módulo */}
            <ul className="divide-y divide-line">
              {g.lessons.map((lesson, li) => {
                const isDone = completed.has(lesson.id);
                const prevDone = li === 0 || completed.has(g.lessons[li - 1].id);
                const unlocked = moduleUnlocked && (isAdmin || prevDone);

                return (
                  <li key={lesson.id} className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <LessonRow
                        lesson={lesson}
                        index={li + 1}
                        done={isDone}
                        unlocked={unlocked}
                        ready={ready}
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 pr-4">
                        <button
                          onClick={() => setEditing(lesson)}
                          title="Editar clase"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          title="Eliminar clase"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {editing && (
        <ClassEditModal
          cls={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  done,
  unlocked,
  ready,
}: {
  lesson: TradingClass;
  index: number;
  done: boolean;
  unlocked: boolean;
  ready: boolean;
}) {
  const inner = (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
        unlocked ? "hover:bg-card-hover" : "cursor-not-allowed"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
          done
            ? "bg-pos/15 text-pos"
            : unlocked
            ? "bg-brand-soft text-brand"
            : "bg-card-soft text-muted"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : unlocked ? (
          <PlayCircle className="h-4 w-4" />
        ) : (
          <Lock className="h-3.5 w-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${unlocked ? "text-white" : "text-muted"}`}>
          {index}. {lesson.title}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-muted">
          <BarChart3 className="h-3 w-3" /> {lesson.level}
          {done && <span className="ml-1 text-pos">· Completada</span>}
        </p>
      </div>

      {unlocked ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
      ) : (
        <span className="shrink-0 text-[11px] text-muted">{ready ? "Bloqueada" : ""}</span>
      )}
    </div>
  );

  if (!unlocked) return inner;
  return (
    <Link href={`/clases/${lesson.id}`} className="block">
      {inner}
    </Link>
  );
}
