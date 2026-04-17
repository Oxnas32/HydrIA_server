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
  { id: "sim-1", name: "Madrid", location: "Madrid", waterLevelCm: 110, rainMm: 18, turbidity: 2.1, humidity: 45 },
  { id: "sim-2", name: "Barcelona", location: "Barcelona", waterLevelCm: 135, rainMm: 24, turbidity: 3.5, humidity: 62 },
  { id: "sim-3", name: "Valencia", location: "Valencia", waterLevelCm: 95, rainMm: 14, turbidity: 1.8, humidity: 55 },
  { id: "sim-4", name: "Sevilla", location: "Sevilla", waterLevelCm: 82, rainMm: 11, turbidity: 4.2, humidity: 38 },
  { id: "sim-5", name: "Bilbao", location: "Bilbao", waterLevelCm: 145, rainMm: 20, turbidity: 2.9, humidity: 72 },
  { id: "sim-6", name: "Zaragoza", location: "Zaragoza", waterLevelCm: 76, rainMm: 8, turbidity: 1.2, humidity: 41 },
];

export default function Stations() {
  const { stations } = useTelemetry();
  const { mode } = useViewMode();

  const stationsToShow = mode === "real" ? stations : simulatedStations;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-8">
        <h1 className="text-4xl font-bold">
          {mode === "real" ? "Estaciones" : "Estaciones simuladas"}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {mode === "real"
            ? "Consulta pública de las estaciones disponibles y su estado actual."
            : "Vista simulada de estaciones distribuidas en distintos puntos de España."}
        </p>
      </section>

      {stationsToShow.length === 0 ? (
        <div className="rounded-3xl bg-white/5 p-6 text-slate-300">
          No hay estaciones disponibles en este momento.
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {stationsToShow.map((station: any, index: number) => {
            const waterLevel = station?.waterLevelCm;
            const rain = station?.rainMm;
            const turbidity = station?.turbidity;
            const humidity = station?.humidity;
            const status = getStatus(waterLevel);

            return (
              <Link
                key={station?.id ?? index}
                to={`/stations/${station?.id ?? index}`}
                className="rounded-3xl bg-white/5 p-5 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Estación</p>
                    <h2 className="text-2xl font-semibold">
                      {station?.name ?? `Estación ${index + 1}`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {station?.location ?? station?.province ?? "Sin ubicación"}
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

                <div className="mt-5 grid grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Nivel</div>
                    <div className="mt-2 text-xl font-semibold">
                      {waterLevel != null ? `${waterLevel} cm` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Lluvia</div>
                    <div className="mt-2 text-xl font-semibold">
                      {rain != null ? `${rain} mm` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Turbidez</div>
                    <div className="mt-2 text-xl font-semibold">
                      {turbidity != null ? `${turbidity} NTU` : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Humedad</div>
                    <div className="mt-2 text-xl font-semibold">
                      {humidity != null ? `${humidity} %` : "—"}
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