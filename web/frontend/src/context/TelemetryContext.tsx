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
    .filter((station) => (station.waterLevelCm ?? 0) >= 80)
    .map((station) => {
      const isAlert = (station.waterLevelCm ?? 0) >= 120;

      return {
        id: `alert-${station.id}`,
        title: isAlert
          ? `Alerta en ${station.name}`
          : `Vigilancia en ${station.name}`,
        description: isAlert
          ? "Se ha detectado un nivel elevado en la estación."
          : "La estación requiere seguimiento.",
        level: isAlert ? "Alerta" : "Vigilancia",
        stationName: station.name,
      };
    });
}

interface TelemetryData {
  nodeId: string;
  site?: string;
  province?: string;
  lat?: number;
  lng?: number;
  waterLevelCm: number;
  rainMm: number;
  turbidity: number;
  humidity: number;
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
          }));

          setStations(newStations);
          setAlerts(buildAlerts(newStations));
          setError(null);
        }
      })
      .catch(() => {
        setError("No se ha podido conectar con la API.");
      });

    // Sub to Server Sent Events for Live Updates
    const eventSource = new EventSource("http://localhost:3001/events");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.ok && payload.source === "database") {
          // Dynamic deletion support
          if (payload.action === "delete_all") {
            setStations([]);
            setAlerts([]);
            return;
          }
          if (payload.action === "delete" && payload.nodeId) {
            setStations((prev) => {
              const updated = prev.filter((s) => s.id !== payload.nodeId);
              setAlerts(buildAlerts(updated));
              return updated;
            });
            return;
          }

          if (!payload.data) return;
          const newData = payload.data as TelemetryData;

          let newRisk = "OK";
          if (newData.waterLevelCm > 150) newRisk = "WARN";
          if (newData.waterLevelCm > 200) newRisk = "ALERT";

          setStations((prev) => {
            const next = [...prev];
            const idx = next.findIndex(s => s.id === newData.nodeId);
            
            const freshStation: Station = {
              id: newData.nodeId,
              name: newData.site || (idx >= 0 ? next[idx].name : newData.nodeId),
              province: newData.province || (idx >= 0 ? next[idx].province : "Desconocida"),
              location: newData.province || (idx >= 0 ? next[idx].location : "Desconocida"),
              lat: newData.lat ?? (idx >= 0 ? next[idx].lat : undefined),
              lng: newData.lng ?? (idx >= 0 ? next[idx].lng : undefined),
              waterLevelCm: newData.waterLevelCm,
              rainMm: newData.rainMm,
              turbidity: newData.turbidity,
              humidity: newData.humidity,
              risk: newRisk,
            };

            if (idx >= 0) {
              next[idx] = freshStation;
            } else {
              next.push(freshStation);
            }
            
            setAlerts(buildAlerts(next));
            return next;
          });
        }
      } catch (err) {
        console.error("SSE Error:", err);
      }
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