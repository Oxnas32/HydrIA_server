import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

const simulatedAlerts = [
  {
    id: "sim-alert-1",
    title: "Vigilancia en Madrid",
    description: "Nivel elevado y lluvia moderada en la zona.",
    level: "Vigilancia",
    stationName: "Madrid",
  },
  {
    id: "sim-alert-2",
    title: "Alerta en Barcelona",
    description: "Nivel muy alto y lluvia significativa.",
    level: "Alerta",
    stationName: "Barcelona",
  },
  {
    id: "sim-alert-3",
    title: "Vigilancia en Valencia",
    description: "La estación muestra una tendencia ascendente del nivel.",
    level: "Vigilancia",
    stationName: "Valencia",
  },
];

function getStatusColor(status: string) {
  if (status === "Normal") return "bg-emerald-600 text-white";
  if (status === "Vigilancia") return "bg-orange-500 text-white";
  if (status === "Alerta") return "bg-red-600 text-white";
  return "bg-slate-700 text-white";
}

export default function Alerts() {
  const { alerts } = useTelemetry();
  const { mode } = useViewMode();

  const alertsToShow = mode === "real" ? alerts : simulatedAlerts;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 text-slate-900 dark:text-white p-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {mode === "real" ? "Alertas" : "Alertas simuladas"}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
          {mode === "real"
            ? "Consulta pública de avisos generados por la plataforma."
            : "Vista simulada de avisos en un despliegue ampliado por España."}
        </p>
      </section>

      {alertsToShow.length === 0 ? (
        <div className="rounded-3xl bg-white shadow-md border border-slate-100 dark:border-none dark:bg-white/5 p-6 text-slate-600 dark:text-slate-300">
          No hay alertas activas en este momento.
        </div>
      ) : (
        <section className="grid gap-5">
          {alertsToShow.map((alert: any, index: number) => (
            <article
              key={alert?.id ?? index}
              className="rounded-3xl bg-white shadow-sm border border-slate-100 dark:border-none dark:bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {alert?.title ?? `Alerta ${index + 1}`}
                  </h2>

                  {alert?.stationName && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Estación: {alert.stationName}
                    </p>
                  )}

                  <p className="mt-3 text-slate-600 dark:text-slate-300">
                    {alert?.description ?? "Sin descripción"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(
                    alert?.level ?? "Aviso"
                  )}`}
                >
                  {alert?.level ?? "Aviso"}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}