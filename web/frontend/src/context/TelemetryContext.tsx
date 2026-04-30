import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface Station {
  id: string;
  name: string;
  province?: string;
  location?: string;
  lat?: number;
  lng?: number;
  waterLevelCm?: number;
  rainMm?: number;
  turbidity?: number;
  humidity?: number;
  risk?: string;
  riskLabel?: string;
  riskScore?: number;
  riskSummary?: string;
  riskReasons?: string[];
  time?: string;
  updated?: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  level: string;
  stationName?: string;
}

interface TelemetryContextType {
  stations: Station[];
  alerts: AlertItem[];
  error: string | null;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(
  undefined
);

function buildAlerts(stations: Station[]) {
  return stations
    .filter((station) => station.risk === "WARN" || station.risk === "ALERT")
    .map((station) => ({
      id: `alert-${station.id}`,
      title:
        station.risk === "ALERT"
          ? `Alerta en ${station.name}`
          : `Vigilancia en ${station.name}`,
      description:
        station.riskSummary ||
        (station.risk === "ALERT"
          ? "Se ha detectado una situación de riesgo en la estación."
          : "La estación requiere seguimiento."),
      level:
        station.riskLabel ||
        (station.risk === "ALERT" ? "Alerta" : "Vigilancia"),
      stationName: station.name,
    }));
}

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/stations")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.data)) {
          const newStations = data.data.map((item: any) => ({
            id: String(item.id ?? item.nodeId ?? ""),
            name: item.name ?? item.site ?? "Estación",
            province: item.province,
            location: item.location ?? item.province,
            lat: item.lat,
            lng: item.lng,
            waterLevelCm: item.waterLevelCm,
            rainMm: item.rainMm,
            turbidity: item.turbidity,
            humidity: item.humidity,
            risk: item.risk,
            riskLabel: item.riskLabel,
            riskScore: item.riskScore,
            riskSummary: item.riskSummary,
            riskReasons: item.riskReasons ?? [],
            time: item.time,
            updated: item.updated,
          }));

          setStations(newStations);
          setAlerts(buildAlerts(newStations));
          setError(null);
        }
      })
      .catch(() => {
        setError("No se ha podido conectar con la API.");
      });

    const eventSource = new EventSource("http://localhost:3001/events");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (!(payload?.ok && payload.source === "database")) return;

        if (payload.action === "delete_all") {
          setStations([]);
          setAlerts([]);
          return;
        }

        if (payload.action === "delete" && payload.nodeId) {
          setStations((prev) => {
            const next = prev.filter((s) => s.id !== String(payload.nodeId));
            setAlerts(buildAlerts(next));
            return next;
          });
          return;
        }

        if (!payload.data) return;
        const item = payload.data;

        setStations((prevStations) => {
          const newStation: Station = {
            id: String(item.nodeId),
            name: item.site || item.nodeId,
            province: item.province,
            location: item.location ?? item.province,
            lat: item.lat,
            lng: item.lng,
            waterLevelCm: item.waterLevelCm,
            rainMm: item.rainMm,
            turbidity: item.turbidity,
            humidity: item.humidity,
            risk: item.risk,
            riskLabel: item.riskLabel,
            riskScore: item.riskScore,
            riskSummary: item.riskSummary,
            riskReasons: item.riskReasons ?? [],
            time: item.time,
            updated: "ahora mismo",
          };

          const exists = prevStations.some(
            (s) => s.id === String(item.nodeId)
          );

          const nextStations = exists
            ? prevStations.map((station) =>
                station.id === String(item.nodeId)
                  ? { ...station, ...newStation }
                  : station
              )
            : [...prevStations, newStation];

          setAlerts(buildAlerts(nextStations));
          setError(null);

          return nextStations;
        });
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Conexión en tiempo real no disponible.");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <TelemetryContext.Provider value={{ stations, alerts, error }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within TelemetryProvider");
  }
  return context;
}