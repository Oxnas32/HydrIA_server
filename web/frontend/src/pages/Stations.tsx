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

const simulatedStations = [
  {
    id: "sim-1",
    name: "Madrid",
    location: "Madrid",
    waterLevelCm: 110,
    rainMm: 18,
    turbidity: 62,
    humidity: 74,
    riskLabel: "Vigilancia",
    riskSummary: "Nivel elevado y lluvia moderada",
  },
  {
    id: "sim-2",
    name: "Barcelona",
    location: "Barcelona",
    waterLevelCm: 135,
    rainMm: 24,
    turbidity: 81,
    humidity: 86,
    riskLabel: "Alerta",
    riskSummary: "Nivel muy alto y lluvia significativa",
  },
  {
    id: "sim-3",
    name: "Valencia",
    location: "Valencia",
    waterLevelCm: 95,
    rainMm: 14,
    turbidity: 55,
    humidity: 69,
    riskLabel: "Vigilancia",
    riskSummary: "Nivel por encima de la media reciente",
  },
  {
    id: "sim-4",
    name: "Sevilla",
    location: "Sevilla",
    waterLevelCm: 82,
    rainMm: 11,
    turbidity: 49,
    humidity: 66,
    riskLabel: "Vigilancia",
    riskSummary: "Crecimiento reciente del nivel",
  },
  {
    id: "sim-5",
    name: "Bilbao",
    location: "Bilbao",
    waterLevelCm: 70,
    rainMm: 9,
    turbidity: 35,
    humidity: 58,
    riskLabel: "Normal",
    riskSummary: "Valores dentro de la normalidad",
  },
  {
    id: "sim-6",
    name: "Zaragoza",
    location: "Zaragoza",
    waterLevelCm: 76,
    rainMm: 8,
    turbidity: 38,
    humidity: 61,
    riskLabel: "Normal",
    riskSummary: "Valores dentro de la normalidad",
  },
];

export default function Stations() {
  const { stations } = useTelemetry();
  const { mode } = useViewMode();

  const stationsToShow = mode === "real" ? stations : simulatedStations;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 text-slate-900 dark:text-white p-8">
        <h1 className="text-4xl font-bold">
          {mode === "real" ? "Estaciones" : "Estaciones simuladas"}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-200">
          {mode === "real"
            ? "Consulta pública de las estaciones disponibles y su estado actual."
            : "Vista simulada de estaciones distribuidas en distintos puntos de España."}
        </p>
      </section>

      {stationsToShow.length === 0 ? (
        <div className="rounded-3xl bg-white shadow-md border border-slate-100 dark:border-none dark:bg-white/5 p-6 text-slate-600 dark:text-slate-300">
          No hay estaciones disponibles en este momento.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {stationsToShow.map((station: any, index: number) => {
            const waterLevel = station?.waterLevelCm;
            const rain = station?.rainMm;
            const turbidity = station?.turbidity;
            const humidity = station?.humidity;
            const status = station?.riskLabel ?? getStatus(waterLevel);
            const summary = station?.riskSummary ?? "Sin información adicional";

            return (
              <Link
                key={station?.id ?? index}
                to={`/stations/${station?.id ?? index}`}
                className="rounded-3xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 dark:border-none dark:bg-white/5 dark:hover:bg-white/10 p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Estación</p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {station?.name ?? `Estación ${index + 1}`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {station?.location ?? station?.province ?? "Sin ubicación"}
                    </p>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
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

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 dark:border-none dark:bg-indigo-900/40 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Nivel</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {waterLevel != null ? `${waterLevel} cm` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 dark:border-none dark:bg-indigo-900/40 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Lluvia</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {rain != null ? `${rain} mm` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 dark:border-none dark:bg-indigo-900/40 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Turbidez</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {turbidity != null ? turbidity : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 dark:border-none dark:bg-indigo-900/40 p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Humedad</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                      {humidity != null ? humidity : "—"}
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