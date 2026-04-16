import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

const simulatedAlerts = [
  {
    id: "sim-alert-1",
    title: "Vigilancia en Madrid",
    description: "Se detecta un aumento del nivel de agua que requiere seguimiento.",
    level: "Vigilancia",
    stationName: "Madrid",
  },
  {
    id: "sim-alert-2",
    title: "Alerta en Barcelona",
    description: "Se ha detectado un nivel elevado en la estación simulada.",
    level: "Alerta",
    stationName: "Barcelona",
  },
  {
    id: "sim-alert-3",
    title: "Vigilancia en Bilbao",
    description: "La estación presenta valores que aconsejan vigilancia preventiva.",
    level: "Vigilancia",
    stationName: "Bilbao",
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
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-8">
        <h1 className="text-4xl font-bold">
          {mode === "real" ? "Alertas" : "Alertas simuladas"}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {mode === "real"
            ? "Consulta pública de avisos generados por la plataforma."
            : "Vista simulada de avisos en un despliegue ampliado por España."}
        </p>
      </section>

      {alertsToShow.length === 0 ? (
        <div className="rounded-3xl bg-white/5 p-6 text-slate-300">
          No hay alertas activas en este momento.
        </div>
      ) : (
        <section className="grid gap-5">
          {alertsToShow.map((alert: any, index: number) => (
            <article key={alert?.id ?? index} className="rounded-3xl bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {alert?.title ?? `Alerta ${index + 1}`}
                  </h2>

                  {alert?.stationName && (
                    <p className="mt-2 text-sm text-slate-400">
                      Estación: {alert.stationName}
                    </p>
                  )}

                  <p className="mt-3 text-slate-300">
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