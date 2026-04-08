import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { alerts } from "../mockAlerts";
import type { AlertLevel } from "../mockAlerts";

function chip(level: AlertLevel) {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  if (level === "INFO") return `${base} bg-primary/10 text-primary`;
  if (level === "WARN") return `${base} bg-[var(--status-warn)]/15 text-[var(--status-warn)]`;
  return `${base} bg-[var(--status-danger)]/15 text-[var(--status-danger)]`;
}

export default function Alerts() {
  const [level, setLevel] = useState<"ALL" | AlertLevel>("ALL");

  const rows = useMemo(() => {
    return alerts.filter((a) => (level === "ALL" ? true : a.level === level));
  }, [level]);

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Centro de alertas</h1>
          <p className="text-sm text-muted-foreground">Generadas automáticamente por el sistema</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value as "ALL" | AlertLevel)}
          >
            <option value="ALL">Todas</option>
            <option value="CRITICAL">Críticas</option>
            <option value="WARN">Medias</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="text-sm font-medium">Alertas</div>
          <div className="text-xs text-muted-foreground">Filtra y abre la estación afectada</div>
        </div>

        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2">ID</th>
                <th className="py-2">Alerta</th>
                <th className="py-2">Nivel</th>
                <th className="py-2">Estación</th>
                <th className="py-2">Hora</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border/60 hover:bg-accent/40">
                  <td className="py-3 font-mono text-xs">{a.id}</td>
                  <td className="py-3 font-medium">{a.title}</td>
                  <td className="py-3">
                    <span className={chip(a.level)}>{a.level}</span>
                  </td>
                  <td className="py-3">
                    <Link className="underline-offset-4 hover:underline" to={`/stations/${a.stationId}`}>
                      {a.stationId}
                    </Link>
                  </td>
                  <td className="py-3">{a.time}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground" colSpan={5}>
                    No hay alertas con esos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}