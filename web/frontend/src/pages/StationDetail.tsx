import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTelemetry } from "../context/TelemetryContext";
import { simulatedStations } from "../data/simulatedStations";

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

function getPolylinePoints(data: number[], width: number, height: number) {
  if (data.length === 0) return "";

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);

  return data
    .map((value, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function StationDetail() {
  const { id } = useParams();
  const { stations } = useTelemetry();

  const [history, setHistory] = useState<any[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const station = stations.find(
    (item: any, index: number) => String(item?.id ?? index) === String(id)
  ) || simulatedStations.find(
    (item: any) => String(item.id) === String(id)
  );

  const isSimulated = String(id).startsWith("sim-");

  useEffect(() => {
    if (!id) return;
    
    if (isSimulated) {
      setHistory([]);
      setHistoryError(null);
      return;
    }
  
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    const loadHistory = () => {
      fetch(`${API_URL}/stations/${id}/history`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.ok) {
            setHistory(data.data || []);
            setHistoryError(null);
          } else {
            setHistory([]);
            setHistoryError("No se pudo cargar el histórico.");
          }
        })
        .catch(() => {
          setHistory([]);
          setHistoryError("No se pudo cargar el histórico.");
        });
    };
  
    loadHistory();
  
    const interval = setInterval(loadHistory, 3000);
  
    return () => clearInterval(interval);
  }, [id, isSimulated]);

  const waterSeries = useMemo(
    () =>
      history
        .map((item: any) => item?.waterLevelCm)
        .filter((value: any) => typeof value === "number"),
    [history]
  );

  const rainSeries = useMemo(
    () =>
      history
        .map((item: any) => item?.rainMm)
        .filter((value: any) => typeof value === "number"),
    [history]
  );

  if (!station) {
    return (
      <div className="rounded-3xl bg-white/5 p-6">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white">Estación no encontrada</h1>
        <Link
          to="/stations"
          className="mt-4 inline-block rounded bg-white/10 px-4 py-2"
        >
          Volver
        </Link>
      </div>
    );
  }

  const waterLevel = station?.waterLevelCm;
  const rain = station?.rainMm;
  const turbidity = station?.turbidity;
  const humidity = station?.humidity;
  const battery = station?.battery;
  const ext_wakeup = station?.ext_wakeup;
  const status = station?.riskLabel ?? getStatus(waterLevel);
  const summary = station?.riskSummary ?? "Sin explicación disponible";
  const reasons = station?.riskReasons ?? [];

  const waterPoints = getPolylinePoints(waterSeries, 520, 150);
  const rainPoints = getPolylinePoints(rainSeries, 520, 150);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-white via-cyan-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 text-slate-900 dark:text-white p-8">
        <Link
          to="/stations"
          className="rounded bg-white shadow-sm border border-slate-200 dark:border-none dark:bg-white/10 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/20 transition-colors text-slate-900 dark:text-white"
        >
          ← Volver a estaciones
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-400">Detalle de estación</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {station?.name ?? "Estación"}
            </h1>
            <p className="mt-3 text-slate-800 dark:text-slate-300">
              {(station?.location ?? station?.province ?? "Sin ubicación")} - {station?.id ?? "—"}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-slate-800 dark:text-slate-200">
              {summary}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Nivel de agua</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {waterLevel != null ? `${waterLevel} cm` : "—"}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Lluvia</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {rain != null ? `${rain} mm/h` : "—"}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Turbidez</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {turbidity != null ? `${turbidity} NTU` : "—"}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Humedad</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {humidity != null ? `${humidity} %` : "—"}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Batería</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {battery != null ? `${battery} V` : "—"}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
          <div className="text-sm text-slate-700 dark:text-slate-400">Activación</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {ext_wakeup !== undefined ? (ext_wakeup ? "Lluvia (Ext)" : "Temporizador") : "—"}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-md border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Motivos de evaluación</h2>

        {reasons.length === 0 ? (
          <p className="mt-4 text-slate-800 dark:text-slate-300">No hay motivos detallados disponibles.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {reasons.map((reason: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-slate-100 dark:bg-white/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-200"
              >
                {reason}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-md border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Histórico</h2>
          <span className="text-sm text-slate-700 dark:text-slate-400">últimas 24 h</span>
        </div>

        {historyError ? (
          <p className="text-slate-700 dark:text-slate-300">{historyError}</p>
        ) : history.length === 0 ? (
          <p className="text-slate-700 dark:text-slate-300">Todavía no hay histórico suficiente para esta estación.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-4 text-sm text-slate-700 dark:text-slate-300">
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

                {waterPoints && (
                  <polyline
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="4"
                    points={waterPoints}
                  />
                )}

                {rainPoints && (
                  <polyline
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="4"
                    points={rainPoints}
                  />
                )}

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
        )}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-md border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Baremo de referencia</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
            <div className="font-semibold text-white">Nivel de agua</div>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">Normal: &lt; 80 cm</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Vigilancia: 80 - 119 cm</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Alerta: ≥ 120 cm</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
            <div className="font-semibold text-white">Lluvia</div>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">Baja: &lt; 20 mm</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Media: 20 - 40 mm</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Alta: &gt; 40 mm</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
            <div className="font-semibold text-white">Turbidez</div>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">Normal: &lt; 50</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Vigilancia: 50 - 79</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Alta: ≥ 80</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-fuchsia-900/10 p-4">
            <div className="font-semibold text-white">Humedad</div>
            <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">Normal: &lt; 70</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Elevada: 70 - 84</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Muy alta: ≥ 85</p>
          </div>
        </div>
      </section>
    </div>
  );
}