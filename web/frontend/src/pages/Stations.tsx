import { Link } from "react-router-dom";
import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

function getStatus(level?: number) {
  if (level == null) return "Sin datos";
  if (level >= 120) return "Alerta";
  if (level >= 80) return "Vigilancia";
  return "Normal";
}

function getStatusColor(status: string) {
  if (status === "Normal") return "bg-emerald-600 text-white";
  if (status === "Vigilancia") return "bg-orange-500 text-white";
  if (status === "Alerta") return "bg-red-600 text-white";
  return "bg-slate-700 text-white";
}

import { simulatedStations } from "../data/simulatedStations";
export default function Stations() {
  const { stations } = useTelemetry();
  const { mode } = useViewMode();

  const stationsToShow = mode === "real" ? stations : simulatedStations;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-white via-cyan-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 text-slate-900 dark:text-white p-8">
        <h1 className="text-4xl font-bold">
          {mode === "real" ? "Estaciones" : "Estaciones simuladas"}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-800 dark:text-slate-200">
          {mode === "real"
            ? "Consulta pública de las estaciones disponibles y su estado actual."
            : "Vista simulada de estaciones distribuidas en distintos puntos de España."}
        </p>
      </section>

      {stationsToShow.length === 0 ? (
        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-md border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-6 text-slate-800 dark:text-slate-300">
          No hay estaciones disponibles en este momento.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {stationsToShow.map((station: any, index: number) => {
            const waterLevel = station?.waterLevelCm;
            const rain = station?.rainMm;
            const turbidity = station?.turbidity;
            const humidity = station?.humidity;
            const battery = station?.battery;
            const ext_wakeup = station?.ext_wakeup;
            const status = station?.riskLabel ?? getStatus(waterLevel);
            const summary = station?.riskSummary ?? "Sin información adicional";

            return (
              <Link
                key={station?.id ?? index}
                to={`/stations/${station?.id ?? index}`}
                className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 hover:to-cyan-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 dark:hover:to-fuchsia-900/40 p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-400">Estación</p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {station?.name ?? `Estación ${index + 1}`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">
                      {station?.location ?? station?.province ?? "Sin ubicación"}
                    </p>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-400">
                      {summary}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Nivel</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {waterLevel != null ? `${waterLevel} cm` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Lluvia</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {rain != null ? `${rain} mm/h` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Turbidez</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {turbidity != null ? `${turbidity} NTU` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Humedad</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {humidity != null ? `${humidity} %` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Batería</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {battery != null ? `${battery} V` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
                    <div className="text-xs text-slate-700 dark:text-slate-400">Activación</div>
                    <div className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                      {ext_wakeup !== undefined ? (ext_wakeup ? "Lluvia" : "Timer") : "—"}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}