"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { isCompleted, toggleCompleted, onProgressChange } from "@/lib/progress";

export function CompleteButton({ classId }: { classId: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sync = () => setDone(isCompleted(classId));
    sync();
    return onProgressChange(sync);
  }, [classId]);

  return (
    <button
      onClick={() => setDone(toggleCompleted(classId))}
      className={done ? "btn-ghost" : "btn-primary"}
      title="Al completarla se desbloquea la siguiente clase del módulo"
    >
      {done ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-pos" /> Completada
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" /> Marcar como completada
        </>
      )}
    </button>
  );
}
