import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import NationalMap from "../components/NationalMap";
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

function buildDemoSeries(value: number, type: "level" | "rain") {
  const base = value || 0;

  if (type === "level") {
    return [Math.max(base - 18, 5), Math.max(base - 12, 5), Math.max(base - 10, 5), Math.max(base - 4, 5), base, Math.max(base - 6, 5), Math.max(base - 2, 5), base + 5];
  }

  return [Math.max(base - 6, 1), Math.max(base - 4, 1), Math.max(base - 8, 1), Math.max(base - 3, 1), base, Math.max(base - 5, 1), Math.max(base - 2, 1), base + 2];
}

function getPolylinePoints(data: number[], width: number, height: number) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function Dashboard() {
  const { stations, alerts } = useTelemetry();
  const coveredAreas = [...new Set(stations.map((station: any) => station?.province).filter(Boolean))];
  const { mode, setMode } = useViewMode();

  const shownStations = mode === "real"
    ? stations.slice(0, 2)
    : [
        { id: "sim-1", name: "Madrid", location: "Madrid", waterLevelCm: 110, rainMm: 18, turbidity: 2.1, humidity: 45 },
        { id: "sim-2", name: "Barcelona", location: "Barcelona", waterLevelCm: 135, rainMm: 24, turbidity: 3.5, humidity: 62 },
      ];

  const allStationsForSelection = mode === "real"
    ? stations
    : [
        { id: "sim-1", name: "Madrid", location: "Madrid", lat: 40.4168, lng: -3.7038, waterLevelCm: 110, rainMm: 18, turbidity: 2.1, humidity: 45 },
        { id: "sim-2", name: "Barcelona", location: "Barcelona", lat: 41.3874, lng: 2.1686, waterLevelCm: 135, rainMm: 24, turbidity: 3.5, humidity: 62 },
        { id: "sim-3", name: "Valencia", location: "Valencia", lat: 39.4699, lng: -0.3763, waterLevelCm: 95, rainMm: 14, turbidity: 1.8, humidity: 55 },
        { id: "sim-4", name: "Sevilla", location: "Sevilla", lat: 37.3891, lng: -5.9845, waterLevelCm: 82, rainMm: 11, turbidity: 4.2, humidity: 38 },
      ];

  const [selectedStation, setSelectedStation] = useState<any>(null);

  useEffect(() => {
    if (allStationsForSelection.length > 0) {
      setSelectedStation(allStationsForSelection[0]);
    } else {
      setSelectedStation(null);
    }
  }, [mode, allStationsForSelection]);

  const selectedWaterLevel = selectedStation?.waterLevelCm ?? 0;
  const selectedRain = selectedStation?.rainMm ?? 0;
  const selectedTurbidity = selectedStation?.turbidity ?? 0;
  const selectedHumidity = selectedStation?.humidity ?? 0;
  const selectedStatus = getStatus(selectedWaterLevel);

  const levelSeries = useMemo(() => buildDemoSeries(selectedWaterLevel, "level"), [selectedWaterLevel]);
  const rainSeries = useMemo(() => buildDemoSeries(selectedRain, "rain"), [selectedRain]);

  const levelPoints = getPolylinePoints(levelSeries, 520, 150);
  const rainPoints = getPolylinePoints(rainSeries, 520, 150);

  return (
    <div className="space-y-8">
      <section
        className={`rounded-3xl p-8 ${
          mode === "real"
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900"
            : "bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900"
        }`}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">
              {mode === "real"
                ? "Seguimiento en tiempo real de las estaciones instaladas"
                : "Simulación de despliegue nacional"}
            </h1>

            <p className="mt-3 max-w-3xl text-slate-200">
              {mode === "real"
                ? "Consulta pública del estado actual de las estaciones reales del proyecto."
                : "Vista simulada de cómo podría escalarse la plataforma a nivel nacional."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/stations"
              className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
            >
              Ver estaciones
            </Link>
            <Link
              to="/alerts"
              className="rounded-full bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
            >
              Ver alertas
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-slate-300">
                {mode === "real" ? "Estaciones activas" : "Estaciones simuladas"}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {mode === "real" ? stations.length : 120}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-slate-300">
                {mode === "real" ? "Alertas activas" : "Alertas estimadas"}
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {mode === "real" ? alerts.length : 9}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-slate-300">Áreas cubiertas</div>
              <div className="mt-2 text-sm font-medium text-white">
                {mode === "real" ? (coveredAreas.length > 0 ? coveredAreas.join(", ") : "Sin datos") : "España"}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm text-slate-300">Acceso</div>
              <div className="mt-2 text-2xl font-semibold">Público</div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => setMode("real")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "real"
                ? "bg-cyan-500 text-white"
                : "bg-cyan-900/40 text-cyan-200 hover:bg-cyan-800/60"
            }`}
          >
            Vista real
          </button>

          <button
            onClick={() => setMode("simulation")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "simulation"
                ? "bg-orange-400 text-slate-950"
                : "bg-orange-600 text-white hover:bg-orange-500"
            }`}
          >
            Simulación nacional
          </button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white/5 p-5">
          <h2 className="mb-4 text-2xl font-semibold">
            {mode === "real" ? "Mapa de estaciones" : "Mapa de despliegue"}
          </h2>
          <NationalMap onSelectStation={setSelectedStation} />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white/5 p-5">
            <h2 className="mb-4 text-2xl font-semibold">
              {selectedStation ? selectedStation.name : "Estación seleccionada"}
            </h2>

            {selectedStation ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-400">Ubicación</p>
                  <p className="mt-1 text-lg font-medium text-white">
                    {selectedStation.location ?? selectedStation.province ?? "Sin ubicación"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Nivel de agua</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {selectedWaterLevel} cm
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Precipitación</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {selectedRain} mm
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Turbidez</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {selectedTurbidity} NTU
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Humedad</div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {selectedHumidity}%
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Estado</div>
                    <div className="mt-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                          selectedStatus
                        )}`}
                      >
                        {selectedStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-300">
                Selecciona una estación en el mapa para ver sus indicadores.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Evolución últimas 24 h</h2>
              <span className="text-xs text-slate-400">preparado para datos periódicos</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-end gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Nivel
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
                  Lluvia
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <svg viewBox="0 0 520 180" className="h-56 w-full">
                  <line x1="0" y1="150" x2="520" y2="150" stroke="#334155" strokeWidth="1" />
                  <line x1="0" y1="110" x2="520" y2="110" stroke="#334155" strokeWidth="1" />
                  <line x1="0" y1="70" x2="520" y2="70" stroke="#334155" strokeWidth="1" />
                  <line x1="0" y1="30" x2="520" y2="30" stroke="#334155" strokeWidth="1" />

                  <polyline fill="none" stroke="#22d3ee" strokeWidth="4" points={levelPoints} />
                  <polyline fill="none" stroke="#60a5fa" strokeWidth="4" points={rainPoints} />

                  <text x="0" y="172" fill="#94a3b8" fontSize="12">00:00</text>
                  <text x="70" y="172" fill="#94a3b8" fontSize="12">04:00</text>
                  <text x="140" y="172" fill="#94a3b8" fontSize="12">08:00</text>
                  <text x="210" y="172" fill="#94a3b8" fontSize="12">12:00</text>
                  <text x="280" y="172" fill="#94a3b8" fontSize="12">16:00</text>
                  <text x="350" y="172" fill="#94a3b8" fontSize="12">20:00</text>
                  <text x="450" y="172" fill="#94a3b8" fontSize="12">24:00</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          {mode === "real" ? "Modo real" : "Modo despliegue nacional"}
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-4">
            <div className="text-base font-semibold">Qué muestra</div>
            <p className="mt-2 text-sm text-slate-300">
              {mode === "real"
                ? "Se muestran únicamente las estaciones reales que están dadas de alta en el sistema."
                : "Se muestra una representación simulada de cómo podría verse la plataforma con un despliegue extendido por España."}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4">
            <div className="text-base font-semibold">Objetivo</div>
            <p className="mt-2 text-sm text-slate-300">
              {mode === "real"
                ? "Permitir una consulta pública del estado actual del sistema realmente instalado."
                : "Enseñar de forma visual la escalabilidad del proyecto y su posible extensión a nivel nacional."}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4">
            <div className="text-base font-semibold">Interpretación</div>
            <p className="mt-2 text-sm text-slate-300">
              {mode === "real"
                ? "Los datos, estaciones y alertas proceden del backend y representan el estado operativo actual."
                : "Los puntos, estaciones y alertas se generan de forma simulada para ilustrar un escenario futuro de despliegue."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}